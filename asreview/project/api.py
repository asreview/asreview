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
    "ProjectNotFoundError",
]

import json
import os
import shutil
import tempfile
import time
from urllib.request import urlretrieve
import zipfile
from dataclasses import asdict
from dataclasses import replace
from pathlib import Path
from uuid import uuid4
import warnings

import jsonschema
from filelock import FileLock

from asreview.data.loader import _from_file, _get_reader
from asreview.datasets import DatasetManager
from asreview.migrate import migrate_v1_v2
from asreview.project.exceptions import ProjectError
from asreview.project.exceptions import ProjectNotFoundError
from asreview.project.schema import SCHEMA
from asreview.data import DataStore
from asreview.settings import ReviewSettings
from asreview.state.sqlstate import SQLiteState
from asreview.models.default import default_model

from asreview.utils import _check_model, _get_filename_from_url, _is_url

try:
    from asreview._version import __version__
except ImportError:
    __version__ = "0.0.0"

# project types
PROJECT_MODE_SIMULATE = "simulate"

PATH_PROJECT_CONFIG = "project.json"
PATH_PROJECT_CONFIG_LOCK = "project.json.lock"
PATH_FEATURE_MATRICES = "feature_matrices"
PATH_DATA_STORE = "data_store.db"


def is_project(project_obj, raise_on_old_version=True):
    if isinstance(project_obj, Project):
        project_obj = project_obj.project_path

    if raise_on_old_version and not Path(project_obj, "reviews").exists():
        raise ProjectError("Project is of an older version.")

    return Path(project_obj, PATH_PROJECT_CONFIG).exists()


class Project:
    """Project class for ASReview project files."""

    def __init__(self, project_path, project_id=None):
        self.project_path = Path(project_path)
        self.data_dir = self.project_path / "data"
        self.project_id = project_id
        self.data_store = DataStore(Path(project_path, PATH_DATA_STORE))

    @classmethod
    def create(
        cls,
        project_path,
        project_id=None,
        project_mode="oracle",
        project_name=None,
        project_description=None,
        project_authors=None,
        project_tags=None,
    ):
        """Initialize the necessary files specific to the web app."""

        project_path = Path(project_path)

        if project_path.exists():
            raise ValueError("Project path is not empty.")

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
            data_store = DataStore(Path(project_path, PATH_DATA_STORE))
            data_store.create_tables()

            config = {
                "version": __version__,
                "id": project_id,
                "mode": project_mode,
                "name": project_name,
                "description": project_description,
                "authors": project_authors,
                "created_at_unix": int(time.time()),
                "reviews": [],
                "feature_matrices": [],
                "tags": project_tags,
            }

            jsonschema.validate(instance=config, schema=SCHEMA)

            project_fp = Path(project_path, PATH_PROJECT_CONFIG)
            project_fp_lock = Path(project_path, PATH_PROJECT_CONFIG_LOCK)
            lock = FileLock(project_fp_lock, timeout=3)

            with lock:
                with open(project_fp, "w") as f:
                    json.dump(config, f)

        except Exception as err:
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
                with open(project_fp) as fp:
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

        config = self.config
        config.update(kwargs.copy())

        jsonschema.validate(instance=config, schema=SCHEMA)

        self.config = config
        return config

    def add_dataset(self, fp, dataset_id=None, file_writer=None):
        """Add a dataset to the project file.

        Parameters
        ----------
        fp: str, Path
            Filepath to the dataset. It will be copied to the correct location in the
            project file.
        """
        if dataset_id is None:
            dataset_id = uuid4().hex

        self.data_dir.mkdir(exist_ok=True)

        if file_writer is not None:
            save_fp = self.data_dir / fp
            file_writer(save_fp)
        elif _is_url(fp):
            filename = _get_filename_from_url(fp)
            save_fp = self.data_dir / filename
            urlretrieve(fp, save_fp)
        elif Path(fp).exists():
            save_fp = self.data_dir / Path(fp).name
            shutil.copy(fp, save_fp)
        else:
            dataset = DatasetManager().find(fp)
            if dataset is None:
                raise ValueError(
                    "fp should be existing file, or URL or dataset, but does not"
                    f" exist: {fp}"
                )
            save_fp = self.data_dir / dataset.filename
            dataset.to_file(save_fp)
        file_name = save_fp.name

        records = _from_file(save_fp, dataset_id=dataset_id)

        # Internals of the records are leaking out here. We are checking for a specific
        # field and a specific value. If the presence of the field `included` is
        # necessary in the input data, we should move it from `Record` to the `Base`
        # class, so that all record implementations have it.
        if self.config["mode"] == PROJECT_MODE_SIMULATE and (
            any([r.included is None for r in records])
        ):
            raise ValueError("Import fully labeled dataset")

        self.data_store.add_records(records=records)

        # This config update assumes that the project only has one dataset.
        self.update_config(
            dataset_path=file_name,
            name=file_name.rsplit(".", 1)[0],
            datasets=[{"id": dataset_id, "name": file_name}],
        )

    def remove_dataset(self):
        """Remove dataset from project."""
        # reset dataset_path
        self.update_config(dataset_path=None)

        # remove datasets from project
        shutil.rmtree(self.data_dir)
        self.clean_tmp_files()

        # remove state file if present
        if Path(self.project_path, "reviews").is_dir() and any(
            Path(self.project_path, "reviews").iterdir()
        ):
            self.delete_review()

    def read_input_data(self, reader=None, *args, **kwargs):
        file_name = self.config["datasets"][0]["name"]
        fp = self.data_dir / file_name
        reader = _get_reader(fp)
        return reader.read_data(fp, *args, **kwargs)

    @property
    def feature_matrices(self):
        try:
            return self.config["feature_matrices"]
        except Exception:
            return []

    @staticmethod
    def get_matrix_filename(feature_model):
        """Get the file name of the feature matrix for a specific feature model."""
        return f"{feature_model.name}_feature_matrix.{feature_model.__file_extension__}"

    def add_feature_matrix(self, feature_matrix, feature_model):
        """Add feature matrix to project file.

        Parameters
        ----------
        feature_matrix: numpy.ndarray, scipy.sparse.csr.csr_matrix
            The feature matrix to add to the project file.
        feature_model: BaseFeatureExtraction
            Feature extraction class.
        """
        matrix_filename = self.get_matrix_filename(feature_model)
        feature_model.write(
            Path(self.project_path, PATH_FEATURE_MATRICES, matrix_filename),
            feature_matrix,
        )

        # Add the feature matrix to the project config.
        config = self.config

        feature_matrix_config = {
            "id": feature_model.name,
            "filename": matrix_filename,
        }

        # Add container for feature matrices.
        if "feature_matrices" not in config:
            config["feature_matrices"] = []

        config["feature_matrices"].append(feature_matrix_config)

        self.config = config

    def get_feature_matrix(self, feature_model):
        """Get the feature matrix from the project file.

        Parameters
        ----------
        feature_model : BaseFeatureExtraction
            Feature extraction class for which to get the matrix.

        Returns
        -------
        numpy.ndarray, scipy.sparse.csr_matrix:
            Feature matrix. This should have the same length as the dataset.
        """
        matrix_filename = self.get_matrix_filename(feature_model)
        return feature_model.read(
            Path(self.project_path, PATH_FEATURE_MATRICES, matrix_filename)
        )

    @property
    def reviews(self):
        try:
            return self.config["reviews"]
        except Exception:
            return []

    def add_review(
        self,
        review_id=None,
        settings=None,
        reviewer=None,
        start_time=None,
        status="setup",
    ):
        """Add new review metadata.

        Parameters
        ----------
        review_id: str
            The review_id uuid4.
        settings: ReviewSettings
            The settings of the review.
        reviewer: object
            A reviewer object with to_sql() method.
        status: str
            The status of the review. One of 'setup', 'running',
            'finished'.
        start_time:
            Start of the review.

        """

        if review_id is not None and any(
            [x["id"] == review_id for x in self.config["reviews"]]
        ):
            raise ValueError(f"Review with id {review_id} already exists.")

        if review_id is None:
            review_id = uuid4().hex

        if start_time is None:
            start_time = int(time.time())

        config = self.config

        if settings is None:
            settings = ReviewSettings(**default_model())

        Path(self.project_path, "reviews", review_id).mkdir(exist_ok=True, parents=True)
        with open(
            Path(self.project_path, "reviews", review_id, "settings_metadata.json"), "w"
        ) as f:
            json.dump(asdict(settings), f)

        fp_state = Path(self.project_path, "reviews", review_id, "results.db")

        if reviewer is None:
            state = SQLiteState(fp_state)
            state.create_tables()
            state.close()
        else:
            reviewer.to_sql(fp_state)

        review_config = {
            "id": review_id,
            "start_time": int(time.time()),
            "status": status,
            # "end_time": int(time.time())
        }

        # add container for reviews
        if "reviews" not in config:
            config["reviews"] = []

        config["reviews"].append(review_config)

        self.config = config
        return config

    def update_review(self, review_id=None, settings=None, state=None, **kwargs):
        """Update review metadata.

        Parameters
        ----------
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
            review_id = config["reviews"][0]["id"]
        else:
            review_index = [x["id"] for x in self.config["reviews"]].index(review_id)

        if state is not None:
            fp_state = Path(self.project_path, "reviews", review_id, "results.db")
            state.to_sql(fp_state)

        if settings is not None:
            with open(
                Path(self.project_path, "reviews", review_id, "settings_metadata.json"),
                "w",
            ) as f:
                json.dump(asdict(settings), f)

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

        Parameters
        ----------
        review_id: str
            Identifier of the review to mark as finished.
        """

        self.update_review(
            review_id=review_id, status="finished", end_time=int(time.time())
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
            ignore=shutil.ignore_patterns("tmp", "*.lock"),
        )

        # create the archive
        shutil.make_archive(export_fp_tmp, "zip", root_dir=export_fp_tmp)

        # remove the unzipped folder and move zip
        shutil.rmtree(export_fp_tmp)
        shutil.move(f"{export_fp_tmp}.zip", export_fp)

    @classmethod
    def load(
        cls,
        asreview_file,
        project_path,
        safe_import=False,
        reset_model_if_not_found=False,
    ):
        with tempfile.TemporaryDirectory() as tmpdir:
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

            with open(Path(tmpdir, PATH_PROJECT_CONFIG)) as f:
                project_config = json.load(f)

            # if migration is needed, do it here
            if project_config["version"].startswith("1."):
                migrate_v1_v2(tmpdir)

            with open(Path(tmpdir, PATH_PROJECT_CONFIG)) as f:
                project_config = json.load(f)

            if not project_config["version"].startswith("2."):
                raise ValueError("Not possible to import (old) project file.")

            if reset_model_if_not_found:
                settings_fp = Path(
                    tmpdir,
                    "reviews",
                    project_config["reviews"][0]["id"],
                    "settings_metadata.json",
                )
                settings = ReviewSettings.from_file(settings_fp)

                try:
                    _check_model(settings)
                except ValueError as err:
                    warnings.warn(err)
                    settings = replace(settings, **default_model())
                    with open(settings_fp) as f:
                        json.dump(asdict(settings), f)

            if safe_import:
                # assign a new id to the project.
                project_config["id"] = uuid4().hex
                with open(Path(tmpdir, PATH_PROJECT_CONFIG), "r+") as f:
                    # write to file
                    f.seek(0)
                    json.dump(project_config, f)
                    f.truncate()

            shutil.copytree(tmpdir, Path(project_path, project_config["id"]))

        return cls(Path(project_path, project_config["id"]))

    def get_review_error(self, review_id=None):
        if review_id is None:
            review_id = self.config["reviews"][0]["id"]

        error_path = Path(self.project_path, "reviews", review_id, "error.json")
        if error_path.exists():
            with open(error_path, "r") as f:
                return json.load(f)
        else:
            raise ValueError("No error found.")

    def set_review_error(self, err, review_id=None):
        if review_id is None:
            review_id = self.config["reviews"][0]["id"]

        err_type = type(err).__name__

        with open(
            Path(self.project_path, "reviews", review_id, "error.json"), "w"
        ) as f:
            json.dump(
                {
                    "message": f"{err_type}: {err}",
                    "type": f"{err_type}",
                    "time": int(time.time()),
                },
                f,
            )

    def remove_review_error(self, review_id=None):
        if review_id is None:
            review_id = self.config["reviews"][0]["id"]

        error_path = self.project_path / "reviews" / review_id / "error.json"
        if error_path.exists():
            try:
                os.remove(error_path)
            except Exception as err:
                raise ValueError(f"Failed to clear the error. {err}")
