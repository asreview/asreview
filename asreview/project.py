# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

__all__ = [
    "ProjectError",
    "ProjectExistsError",
    "ProjectNotFoundError",
    "open_state",
    "ASReviewProject",
    "get_project_path",
    "project_from_id",
    "get_projects",
    "is_project",
    "is_v0_project",
]

import json
import logging
import os
import pickle
import shutil
import tempfile
import time
import zipfile
from contextlib import contextmanager
from datetime import datetime
from functools import wraps
from pathlib import Path
from uuid import uuid4

import jsonschema
import numpy as np
import pandas as pd
from filelock import FileLock
from scipy.sparse import csr_matrix
from scipy.sparse import load_npz
from scipy.sparse import save_npz

from asreview._version import get_versions
from asreview.config import LABEL_NA
from asreview.config import PROJECT_MODE_EXPLORE
from asreview.config import PROJECT_MODE_ORACLE
from asreview.config import PROJECT_MODE_SIMULATE
from asreview.config import PROJECT_MODES
from asreview.config import SCHEMA
from asreview.data import ASReviewData
from asreview.exceptions import CacheDataError
from asreview.state.errors import StateNotFoundError
from asreview.state.sqlstate import SQLiteState
from asreview.utils import asreview_path

PATH_PROJECT_CONFIG = "project.json"
PATH_PROJECT_CONFIG_LOCK = "project.json.lock"
PATH_FEATURE_MATRICES = "feature_matrices"


class ProjectError(Exception):
    pass


class ProjectExistsError(Exception):
    pass


class ProjectNotFoundError(Exception):
    pass


def get_project_path(folder_id):
    """Get the project directory.

    Arguments
    ---------
    folder_id: str
        The id of the folder containing a project. If there is no
        authentication, the folder_id is equal to the project_id. Otherwise,
        this is equal to {project_owner_id}_{project_id}.
    """
    return Path(asreview_path(), folder_id)


def project_from_id(f):
    """Decorator function that takes a user account as parameter,
    the user account is used to get the correct sub folder in which
    the projects is
    """

    @wraps(f)
    def decorated_function(project_id, *args, **kwargs):
        project_path = get_project_path(project_id)
        if not is_project(project_path):
            raise ProjectNotFoundError(f"Project '{project_id}' not found")
        project = ASReviewProject(project_path, project_id=project_id)
        return f(project, *args, **kwargs)

    return decorated_function


def get_projects(project_paths=None):
    """Get the ASReview projects at the given paths.

    Arguments
    ---------
    project_paths : list[Path], optional
        List of paths to projects. By default all the projects in the asreview
        folder are used, by default None

    Returns
    -------
    list[ASReviewProject]
        Projects at the given project paths.
    """
    if project_paths is None:
        project_paths = [path for path in asreview_path().iterdir() if path.is_dir()]

    return [ASReviewProject(project_path) for project_path in project_paths]


def is_project(project_path):
    project_path = Path(project_path) / PATH_PROJECT_CONFIG

    return project_path.exists()


def is_v0_project(project_path):
    """Check if a project file is of a ASReview version 0 project."""

    return not Path(project_path, "reviews").exists()


@contextmanager
def open_state(asreview_obj, review_id=None, read_only=True):
    """Initialize a state class instance from a project folder.

    Arguments
    ---------
    asreview_obj: str/pathlike/ASReviewProject
        Filepath to the (unzipped) project folder or ASReviewProject object.
    review_id: str
        Identifier of the review from which the state will be instantiated.
        If none is given, the first review in the reviews folder will be taken.
    read_only: bool
        Whether to open in read_only mode.

    Returns
    -------
    SQLiteState
    """

    # Unzip the ASReview data if needed.
    if isinstance(asreview_obj, ASReviewProject):
        project = asreview_obj
    elif zipfile.is_zipfile(asreview_obj) and Path(asreview_obj).suffix == ".asreview":
        if not read_only:
            raise ValueError("ASReview files do not support not read only files.")

        # work from a temp dir
        tmpdir = tempfile.TemporaryDirectory()
        project = ASReviewProject.load(asreview_obj, tmpdir.name)
    else:
        project = ASReviewProject(asreview_obj)

    # init state class
    state = SQLiteState(read_only=read_only)

    try:
        if len(project.reviews) > 0:
            if review_id is None:
                review_id = project.config["reviews"][0]["id"]
            logging.debug(f"Opening review {review_id}.")
            state._restore(project.project_path, review_id)
        elif len(project.reviews) == 0 and not read_only:
            review_id = uuid4().hex
            logging.debug(f"Create new review (state) with id {review_id}.")
            state._create_new_state_file(project.project_path, review_id)
            project.add_review(review_id)
        else:
            raise StateNotFoundError(
                "State file does not exist, and in read only mode."
            )
        yield state
    finally:
        try:
            state.close()
        except AttributeError:
            # file seems to be closed, do nothing
            pass


class ASReviewProject:
    """Project class for ASReview project files."""

    def __init__(self, project_path, project_id=None):
        self.project_path = Path(project_path)
        self.project_id = project_id

    @classmethod
    def create(
        cls,
        project_path,
        project_id=None,
        project_mode="oracle",
        project_name=None,
        project_description=None,
        project_authors=None,
    ):
        """Initialize the necessary files specific to the web app."""

        project_path = Path(project_path)

        if is_project(project_path):
            raise ProjectExistsError("Project already exists.")

        if project_mode not in PROJECT_MODES:
            raise ValueError(
                f"Project mode '{project_mode}' is not in " f"{PROJECT_MODES}."
            )

        if project_id is None:
            project_id = project_path.stem

        if project_name is None:
            project_name = project_path.stem

        if project_path.is_dir():
            raise IsADirectoryError(f"Project folder {project_path} already exists.")

        try:
            project_path.mkdir(parents=True, exist_ok=True)
            Path(project_path, "data").mkdir(exist_ok=True)
            Path(project_path, PATH_FEATURE_MATRICES).mkdir(exist_ok=True)
            Path(project_path, "reviews").mkdir(exist_ok=True)

            config = {
                "version": get_versions()["version"],
                "id": project_id,
                "mode": project_mode,
                "name": project_name,
                "description": project_description,
                "authors": project_authors,
                "created_at_unix": int(time.time()),
                "datetimeCreated": str(datetime.now()),
                "reviews": [],
                "feature_matrices": [],
            }

            # validate new config before storing
            jsonschema.validate(instance=config, schema=SCHEMA)

            project_fp = Path(project_path, PATH_PROJECT_CONFIG)
            project_fp_lock = Path(project_path, PATH_PROJECT_CONFIG_LOCK)
            lock = FileLock(project_fp_lock, timeout=3)

            # create a file with project info
            with lock:
                with open(project_fp, "w") as f:
                    json.dump(config, f)

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
            project_fp = Path(self.project_path, PATH_PROJECT_CONFIG)
            project_fp_lock = Path(self.project_path, PATH_PROJECT_CONFIG_LOCK)
            lock = FileLock(project_fp_lock, timeout=3)

            if not project_fp.exists():
                raise ProjectNotFoundError(f"Project '{self.project_path}' not found")

            with lock:
                # read the file with project info
                with open(project_fp, "r") as fp:
                    config = json.load(fp)
                    self._config = config

                    return config

    @config.setter
    def config(self, config):
        project_fp = Path(self.project_path, PATH_PROJECT_CONFIG)
        project_fp_lock = Path(self.project_path, PATH_PROJECT_CONFIG_LOCK)
        lock = FileLock(project_fp_lock, timeout=3)

        with lock:
            with open(project_fp, "w") as f:
                json.dump(config, f)

        self._config = config

    def update_config(self, **kwargs):
        """Update project info"""

        kwargs_copy = kwargs.copy()

        # validate schema
        if "mode" in kwargs_copy and kwargs_copy["mode"] not in PROJECT_MODES:
            raise ValueError("Project mode '{}' not found.".format(kwargs_copy["mode"]))

        # update project file
        config = self.config
        config.update(kwargs_copy)

        # validate new config before storing
        jsonschema.validate(instance=config, schema=SCHEMA)

        self.config = config
        return config

    def add_dataset(self, file_name):
        """Add file path to the project file.

        Add file to data subfolder and fill the pool of iteration 0.
        """

        # fill the pool of the first iteration
        fp_data = Path(self.project_path, "data", file_name)
        as_data = ASReviewData.from_file(fp_data)

        if self.config["mode"] == PROJECT_MODE_SIMULATE and \
                (as_data.labels is None or (as_data.labels == LABEL_NA).any()):
            raise ValueError("Import fully labeled dataset")

        if self.config["mode"] == PROJECT_MODE_EXPLORE and as_data.labels is None:
            raise ValueError("Import partially or fully labeled dataset")

        self.update_config(dataset_path=file_name)

        with open_state(self.project_path, read_only=False) as state:
            # save the record ids in the state file
            state.add_record_table(as_data.record_ids)

            # if the data contains labels and oracle mode, add them to the state file
            if (
                self.config["mode"] == PROJECT_MODE_ORACLE
                and as_data.labels is not None
            ):
                labeled_indices = np.where(as_data.labels != LABEL_NA)[0]
                labels = as_data.labels[labeled_indices].tolist()
                labeled_record_ids = as_data.record_ids[labeled_indices].tolist()

                # add the labels as prior data
                state.add_labeling_data(
                    record_ids=labeled_record_ids,
                    labels=labels,
                    notes=[None for _ in labeled_record_ids],
                    prior=True,
                )

    def remove_dataset(self):
        """Remove dataset from project."""
        # reset dataset_path
        self.update_config(dataset_path=None)

        # remove datasets from project
        shutil.rmtree(Path(self.project_path, "data"))

        # remove state file if present
        if Path(self.project_path, "reviews").is_dir() and any(
            Path(self.project_path, "reviews").iterdir()
        ):
            self.delete_review()

    def _read_data_from_cache(self, version_check=True):

        fp_data = Path(self.project_path, "data", self.config["dataset_path"])
        fp_data_pickle = Path(fp_data).with_suffix(fp_data.suffix + ".pickle")

        try:
            with open(fp_data_pickle, "rb") as f_pickle_read:
                data_obj, data_obj_version = pickle.load(f_pickle_read)

            if not isinstance(data_obj.df, pd.DataFrame):
                raise ValueError()

            if (not version_check) or (get_versions()["version"] == data_obj_version):
                return data_obj

        except FileNotFoundError:
            pass
        except Exception as err:
            logging.error(f"Error reading cache file: {err}")
            try:
                os.remove(fp_data_pickle)
            except FileNotFoundError:
                pass

        raise CacheDataError()

    def read_data(self, use_cache=True, save_cache=True):
        """Get ASReviewData object from file.

        Parameters
        ----------
        use_cache: bool
            Use the pickle file if available.
        save_cache: bool
            Save the file to a pickle file if not available.

        Returns
        -------
        ASReviewData:
            The data object for internal use in ASReview.

        """

        try:
            fp_data = Path(self.project_path, "data", self.config["dataset_path"])
        except Exception:
            raise FileNotFoundError("Dataset not found")

        if use_cache:
            try:
                return self._read_data_from_cache(fp_data)
            except CacheDataError:
                pass

        data_obj = ASReviewData.from_file(fp_data)

        if save_cache:
            fp_data_pickle = Path(fp_data).with_suffix(fp_data.suffix + ".pickle")
            with open(fp_data_pickle, "wb") as f_pickle:
                pickle.dump((data_obj, get_versions()["version"]), f_pickle)

        return data_obj

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

    @property
    def feature_matrices(self):
        try:
            return self.config["feature_matrices"]
        except Exception:
            return []

    def add_feature_matrix(self, feature_matrix, feature_extraction_method):
        """Add feature matrix to project file.

        Arguments
        ---------
        feature_matrix: numpy.ndarray, scipy.sparse.csr.csr_matrix
            The feature matrix to add to the project file.
        feature_extraction_method: str
            Name of the feature extraction method.
        """
        # Make sure the feature matrix is in csr format.
        if isinstance(feature_matrix, np.ndarray):
            feature_matrix = csr_matrix(feature_matrix)
        if not isinstance(feature_matrix, csr_matrix):
            raise ValueError(
                "The feature matrix should be convertible to type "
                "scipy.sparse.csr.csr_matrix."
            )

        matrix_filename = f"{feature_extraction_method}_feature_matrix.npz"
        save_npz(
            Path(self.project_path, PATH_FEATURE_MATRICES, matrix_filename),
            feature_matrix,
        )

        # Add the feature matrix to the project config.
        config = self.config

        feature_matrix_config = {
            "id": feature_extraction_method,
            "filename": matrix_filename,
        }

        # Add container for feature matrices.
        if "feature_matrices" not in config:
            config["feature_matrices"] = []

        config["feature_matrices"].append(feature_matrix_config)

        self.config = config

    def get_feature_matrix(self, feature_extraction_method):
        """Get the feature matrix from the project file.

        Arguments
        ---------
        feature_extraction_method: str
            Name of the feature extraction method for which to get the matrix.

        Returns
        -------
        scipy.sparse.csr_matrix:
            Feature matrix in sparse format.
        """
        matrix_filename = f"{feature_extraction_method}_feature_matrix.npz"
        return load_npz(Path(self.project_path, PATH_FEATURE_MATRICES, matrix_filename))

    @property
    def reviews(self):
        try:
            return self.config["reviews"]
        except Exception:
            return []

    def add_review(self, review_id, start_time=None, status="setup"):
        """Add new review metadata.

        Arguments
        ---------
        review_id: str
            The review_id uuid4.
        status: str
            The status of the review. One of 'setup', 'running',
            'finished'.
        start_time:
            Start of the review.

        """
        if start_time is None:
            start_time = datetime.now()

        # Add the review to the project.
        config = self.config

        review_config = {
            "id": review_id,
            "start_time": str(start_time),
            "status": status
            # "end_time": datetime.now()
        }

        # add container for reviews
        if "reviews" not in config:
            config["reviews"] = []

        config["reviews"].append(review_config)

        self.config = config

    def update_review(self, review_id=None, **kwargs):
        """Update review metadata.

        Arguments
        ---------
        review_id: str
            The review_id uuid4. Default None, which is the
            first added review.
        status: str
            The status of the review. One of 'setup', 'running',
            'finished'.
        start_time:
            Start of the review.
        end_time: End time of the review.
        """

        # read the file with project info
        config = self.config

        if review_id is None:
            review_index = 0
        else:
            review_index = [x["id"] for x in self.config["reviews"]].index(review_id)

        review_config = config["reviews"][review_index]
        review_config.update(kwargs)

        config["reviews"][review_index] = review_config

        # update the file with project info
        self.config = config

    def delete_review(self, remove_folders=False):
        try:
            # remove the folder tree
            shutil.rmtree(Path(self.project_path, PATH_FEATURE_MATRICES))

            # recreate folder structure if True
            if not remove_folders:
                Path(self.project_path, PATH_FEATURE_MATRICES).mkdir(exist_ok=True)
        except Exception:
            print("Failed to remove feature matrices.")

        try:
            path_review = Path(self.project_path, "reviews")
            shutil.rmtree(path_review)
            if not remove_folders:
                Path(self.project_path, "reviews").mkdir(exist_ok=True)
        except Exception:
            print("Failed to remove sql database.")

        # update the config
        self.update_config(**{"reviews": [], "feature_matrices": []})

    def mark_review_finished(self, review_id=None):
        """Mark a review in the project as finished.

        If no review_id is given, mark the first review as finished.

        Arguments
        ---------
        review_id: str
            Identifier of the review to mark as finished.
        """

        self.update_review(
            review_id=review_id, status="finished", end_time=str(datetime.now())
        )

    def export(self, export_fp):
        if Path(export_fp).suffix != ".asreview":
            raise ValueError("Export file should have .asreview extension.")

        if Path(export_fp) == Path(self.project_path):
            raise ValueError("export_fp should not be identical to project path.")

        export_fp_tmp = Path(export_fp).with_suffix(".asreview.zip")

        # copy the source tree, but ignore pickle files
        shutil.copytree(
            self.project_path,
            export_fp_tmp,
            ignore=shutil.ignore_patterns("*.pickle", "*.lock"),
        )

        # create the archive
        shutil.make_archive(export_fp_tmp, "zip", root_dir=export_fp_tmp)

        # remove the unzipped folder and move zip
        shutil.rmtree(export_fp_tmp)
        shutil.move(f"{export_fp_tmp}.zip", export_fp)

    @classmethod
    def load(cls, asreview_file, project_path, safe_import=False):
        tmpdir = tempfile.TemporaryDirectory().name

        try:
            # Unzip the project file
            with zipfile.ZipFile(asreview_file, "r") as zip_obj:
                zip_filenames = zip_obj.namelist()

                # raise error if no ASReview project file
                if PATH_PROJECT_CONFIG not in zip_filenames:
                    raise ValueError("Project file is not valid project.")

                # extract all files to folder
                for f in zip_filenames:
                    if not f.endswith(".pickle"):
                        zip_obj.extract(f, path=tmpdir)

        except zipfile.BadZipFile:
            raise ValueError("File is not an ASReview file.")

        with open(Path(tmpdir, PATH_PROJECT_CONFIG), "r") as f:
            project_config = json.load(f)

        if safe_import:
            # assign a new id to the project.
            project_config["id"] = uuid4().hex
            with open(Path(tmpdir, PATH_PROJECT_CONFIG), "r+") as f:
                # write to file
                f.seek(0)
                json.dump(project_config, f)
                f.truncate()

        # location to copy file to
        # Move the project from the temp folder to the projects folder.
        os.replace(tmpdir, Path(project_path, project_config["id"]))

        return cls(Path(project_path, project_config["id"]))

    def set_error(self, err, save_error_message=True):
        err_type = type(err).__name__
        self.update_review(status="error")

        # write error to file if label method is prior (first iteration)
        if save_error_message:
            message = {
                "message": f"{err_type}: {err}",
                "type": f"{err_type}",
                "datetime": str(datetime.now()),
            }

            with open(Path(self.project_path, "error.json"), "w") as f:
                json.dump(message, f)

    def remove_error(self, status):
        error_path = self.project_path / "error.json"
        if error_path.exists():
            try:
                os.remove(error_path)
            except Exception as err:
                raise ValueError(f"Failed to clear the error. {err}")
        self.update_review(status=status)
