# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import zipfile
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import numpy as np
import pandas as pd

from asreview._version import get_versions
from asreview.config import LABEL_NA
from asreview.config import PROJECT_MODES
from asreview.state.errors import StateError
from asreview.state.errors import StateNotFoundError
from asreview.state.paths import get_data_path
from asreview.state.paths import get_project_file_path
from asreview.state.paths import get_reviews_path
from asreview.state.paths import get_feature_matrices_path
from asreview.state.sqlstate import SqlStateV1
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.io import read_data
from asreview.utils import asreview_path
from asreview.state.utils import is_zipped_project_file
from asreview.state.utils import is_valid_project_folder


from functools import wraps


PATH_FEATURE_MATRICES = 'feature_matrices'


class ProjectNotFoundError(Exception):
    pass

# def project_from_id(project_id, *args, **kwargs):

#     return ASReviewProject(project_id, *args, **kwargs)

def get_project_path(project_id, asreview_dir=None):
    """Get the project directory.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    if asreview_dir is None:
        asreview_dir = asreview_path()

    return Path(asreview_dir, project_id)


def project_from_id(f):
    @wraps(f)
    def decorated_function(project_id, *args, **kwargs):

        project_path = get_project_path(project_id)
        project = ASReviewProject(project_path, project_id=project_id)
        return f(project, *args, **kwargs)

    return decorated_function


def list_asreview_projects():
    """List the projects in the asreview path"""

    file_list = []
    for x in asreview_path().iterdir():
        if x.is_dir():
            try:
                project = ASReviewProject(x)
                project.project_id = project.config["id"]
                file_list.append(project)
            except Exception:
                pass
    return file_list


def _create_project_id(name):
    """Create project id from input name."""

    if isinstance(name, str) \
            and len(name) > 0 \
            and not name[0].isalnum():
        raise ValueError(
            "First character should be alphabet"
            " letter (a-z) or number (0-9).")

    if not name \
            and not isinstance(name, str) \
            and len(name) >= 3:
        raise ValueError(
            "Project name should be at least 3 characters.")

    project_id = ""
    for c in name.lower():
        if c.isalnum():
            project_id += c
        elif len(project_id) > 0 and project_id[-1] != "-":
            project_id += "-"

    return project_id


def is_project(project_path):

    project_path = Path(project_path) / "project.json"

    return project_path.exists()


def is_v0_project(project_path):
    """Check if a project file is of a ASReview version 0 project."""

    return not get_reviews_path(project_path).exists()


@contextmanager
def open_state(working_dir, review_id=None, read_only=True):
    """Initialize a state class instance from a project folder.

    Arguments
    ---------
    working_dir: str/pathlike
        Filepath to the (unzipped) project folder.
    review_id: str
        Identifier of the review from which the state will be instantiated.
        If none is given, the first review in the reviews folder will be taken.
    read_only: bool
        Whether to open in read_only mode.

    Returns
    -------
    SqlStateV1
    """
    working_dir = Path(working_dir)

    if not get_reviews_path(working_dir).is_dir():
        if read_only:
            raise StateNotFoundError(f"There is no valid project folder"
                                     f" at {working_dir}")
        else:
            ASReviewProject.create(working_dir)
            review_id = uuid4().hex

    # Check if file is a valid project folder.
    is_valid_project_folder(working_dir)

    # Get the review_id of the first review if none is given.
    # If there is no review yet, create a review id.
    if review_id is None:
        reviews = list(get_reviews_path(working_dir).iterdir())
        if reviews:
            review_id = reviews[0].name
        else:
            review_id = uuid4().hex

    # init state class
    state = SqlStateV1(read_only=read_only)

    try:
        if Path(get_reviews_path(working_dir), review_id).is_dir():
            state._restore(working_dir, review_id)
        elif not Path(get_reviews_path(working_dir), review_id).is_dir() \
                and not read_only:
            state._create_new_state_file(working_dir, review_id)
        else:
            raise StateNotFoundError("State file does not exist, and in "
                                     "read only mode.")
        yield state
    finally:
        try:
            state.close()
        except AttributeError:
            # file seems to be closed, do nothing
            pass


class ASReviewProject():

    def __init__(self, project_path, project_id=None):
        self.project_path = project_path
        self.project_id = project_id

    @classmethod
    def create(cls,
               project_path,
               project_id=None,
               project_mode="oracle",
               project_name=None,
               project_description=None,
               project_authors=None):
        """Initialize the necessary files specific to the web app."""

        if is_project(project_path):
            raise ValueError("Project already exists.")

        if project_mode not in PROJECT_MODES:
            raise ValueError(f"Project mode '{project_mode}' is not in "
                             f"{PROJECT_MODES}.")

        project_id = project_path.stem

        if not project_id and not isinstance(project_id, str) \
                and len(project_id) >= 3:
            raise ValueError("Project name should be at least 3 characters.")

        if project_path.is_dir():
            raise IsADirectoryError(
                f'Project folder {project_path} already exists.')

        try:
            project_path.mkdir(exist_ok=True)
            get_data_path(project_path).mkdir(exist_ok=True)
            Path(project_path, PATH_FEATURE_MATRICES).mkdir(exist_ok=True)
            get_reviews_path(project_path).mkdir(exist_ok=True)

            project_config = {
                'version': get_versions()['version'],  # todo: Fail without git?
                'id': project_id,
                'mode': project_mode,
                'name': project_name,
                'description': project_description,
                'authors': project_authors,
                'created_at_unix': int(time.time()),

                # project related variables
                'datetimeCreated': str(datetime.now()),
                'projectInitReady': False,
                'reviewFinished': False,
                'reviews': [],
                'feature_matrices': []
            }

            # create a file with project info
            with open(get_project_file_path(project_path), "w") as f:
                json.dump(project_config, f)

        except Exception as err:
            # remove all generated folders and raise error
            shutil.rmtree(project_path)
            raise err

        return cls(project_path, project_id=project_id)

    @property
    def config(self):

        try:
            return self._config
        except AttributeError:

            try:

                # read the file with project info
                with open(get_project_file_path(self.project_path), "r") as fp:

                    config = json.load(fp)
                    self._config = config

                    return config

            except FileNotFoundError:
                raise ProjectNotFoundError(
                    f"Project '{self.project_path}' not found")

    @config.setter
    def config(self, config):

        self._config = config

    def update_config(self, **kwargs):
        '''Update project info'''

        kwargs_copy = kwargs.copy()

        if "name" in kwargs_copy:
            del kwargs_copy["name"]
            logging.info(
                "Update project name is ignored, use 'rename_project' function.")

        # validate schema
        if "mode" in kwargs_copy and kwargs_copy["mode"] not in PROJECT_MODES:
            raise ValueError(
                "Project mode '{}' not found.".format(kwargs_copy["mode"]))

        # update project file
        project_fp = get_project_file_path(self.project_path)

        with open(project_fp, "r") as fp:
            config = json.load(fp)

        config.update(kwargs_copy)

        with open(project_fp, "w") as fp:
            json.dump(config, fp)

        self._config = config
        return config


    def rename(self, project_name_new):
        """Rename a project id.

        This function only works for projects in ASReview LAB  web interface.
        This is the result of the file storage in
        asreview.webapp.utils.project_path.asreview_path.

        Arguments
        ---------
        project_id: str
            The current project_id.
        project_name_new: str
            The new project name to be converted into a new
            project_id.

        Returns
        -------
        str:
            The new project_id.
        """

        # create a new project_id from project name
        project_id_new = _create_project_id(project_name_new)
        project_path_new = Path(asreview_path(), project_id_new)

        if (self.project_path == project_path_new):
            # nothing to do
            return self

        if (self.project_path != project_path_new) & is_project(project_path_new):
            raise ValueError(f"Project '{project_path_new}' already exists.")

        project_file_path_new = get_project_file_path(project_path_new)

        self.project_path.rename(project_path_new)
        self.project_path = project_path_new
        self.project_id = project_id_new

        # update the project file
        config = self.config

        config["id"] = project_id_new
        config["name"] = project_name_new

        self.config = config
        self._config = config

        return self


    def add_dataset(self, file_name):
        """Add file path to the project file.

        Add file to data subfolder and fill the pool of iteration 0.
        """
        self.update_config(dataset_path=file_name)

        # fill the pool of the first iteration
        as_data = read_data(self.project_path)

        with open_state(self.project_path, read_only=False) as state:

            # save the record ids in the state file
            state.add_record_table(as_data.record_ids)

            # if the data contains labels, add them to the state file
            if as_data.labels is not None:

                labeled_indices = np.where(as_data.labels != LABEL_NA)[0]
                labels = as_data.labels[labeled_indices].tolist()
                labeled_record_ids = as_data.record_ids[labeled_indices].tolist()

                # add the labels as prior data
                state.add_labeling_data(
                    record_ids=labeled_record_ids,
                    labels=labels,
                    notes=[None for _ in labeled_record_ids],
                    prior=True
                )

    def remove_dataset(self):
        """Remove dataset from project.

        """
        # reset dataset_path
        self.update_config(dataset_path=file_name)

        # remove datasets from project
        shutil.rmtree(get_data_path(self.project_path))

        # remove state file if present
        if get_reviews_path(self.project_path).is_dir() and \
                any(get_reviews_path(self.project_path).iterdir()):
            self.delete_state()

    def clean_tmp_files(self):
        """Clean temporary files in a project.

        Arguments
        ---------
        project_id: str
            The id of the current project.
        """

        # clean pickle files
        for f_pickle in self.project_path.rglob("*.pickle"):
            try:
                os.remove(f_pickle)
            except OSError as e:
                print(f"Error: {f_pickle} : {e.strerror}")


    def delete_state(self, remove_folders=False):

        try:
            # remove the folder tree
            shutil.rmtree(Path(self.project_path, PATH_FEATURE_MATRICES))

            # recreate folder structure if True
            if not remove_folders:
                Path(self.project_path, PATH_FEATURE_MATRICES).mkdir(exist_ok=True)
        except Exception:
            print("Failed to remove feature matrices.")

        try:
            path_review = get_reviews_path(self.project_path)
            shutil.rmtree(path_review)
            if not remove_folders:
                get_reviews_path(self.project_path).mkdir(exist_ok=True)
        except Exception:
            print("Failed to remove sql database.")

        # update the config
        self.update_config({
            'projectInitReady': False,
            'reviewFinished': False,
            'reviews': [],
            'feature_matrices': []
        })

    def add_review(self, simulation_id):
        update_review(simulation_id, True)


    def update_review(self, review_id, review_finished):

        # read the file with project info
        config = self.config

        if "reviews" not in config:
            config["reviews"] = []

        config["reviews"].append(
            {"id": review_id, "state": review_finished}
        )

        # update the file with project info
        self.config = config

    def export(self, export_fp):

        if Path(export_fp).suffix != ".asreview":
            raise ValueError("Export file should have .asreview extension.")

        export_fp_tmp = Path(export_fp).with_suffix(".asreview.tmp")

        # copy the source tree, but ignore pickle files
        shutil.copytree(self.project_path,
                        export_fp_tmp,
                        ignore=shutil.ignore_patterns('*.pickle'))

        # create the archive
        shutil.make_archive(export_fp_tmp,
                            "zip",
                            root_dir=export_fp_tmp)

        # remove the unzipped folder and move zip
        shutil.rmtree(export_fp_tmp)
        shutil.move(f'{export_fp_tmp}.zip', export_fp)


def import_project_file(file_name):
    """Import .asreview project file"""

    try:
        # Unzip the project file
        with zipfile.ZipFile(file_name, "r") as zip_obj:
            zip_filenames = zip_obj.namelist()

            # raise error if no ASReview project file
            if "project.json" not in zip_filenames:
                raise ValueError("File doesn't contain valid project format.")

            # extract all files to a temporary folder
            tmpdir = tempfile.mkdtemp()
            zip_obj.extractall(path=tmpdir)

    except zipfile.BadZipFile:
        raise ValueError("File is not an ASReview file.")

    try:
        # Open the project file and check the id. The id needs to be
        # unique, otherwise it is exended with -copy.
        import_project = None
        fp = Path(tmpdir, "project.json")
        with open(fp, "r+") as f:

            # load the project info in scope of function
            import_project = json.load(f)

            # If the uploaded project already exists,
            # then overwrite project.json with a copy suffix.
            while is_project(import_project["id"]):
                # project update
                import_project["id"] = f"{import_project['id']}-copy"
                import_project["name"] = f"{import_project['name']} copy"
            else:
                # write to file
                f.seek(0)
                json.dump(import_project, f)
                f.truncate()

        # location to copy file to
        fp_copy = get_project_path(import_project["id"])
        # Move the project from the temp folder to the projects folder.
        os.replace(tmpdir, fp_copy)

    except Exception:
        # Unknown error.
        raise ValueError("Failed to import project "
                         f"'{file_name.filename}'.")

    project_info = {}
    project_info["id"] = import_project["id"]
    project_info["name"] = import_project["name"]

    return project_info

