# Copyright 2019-2024 The ASReview Authors. All Rights Reserved.
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

import logging
import tempfile
import zipfile
from contextlib import contextmanager
from pathlib import Path
from uuid import uuid4

from asreview.project import Project
from asreview.project import is_project, ProjectNotFoundError, ProjectError
from asreview.state.errors import StateNotFoundError
from asreview.state.sqlstate import SQLiteState


@contextmanager
def open_state(asreview_obj, review_id=None, create_new=True):
    """Initialize a state class instance from a project folder.

    Arguments
    ---------
    asreview_obj: str/pathlike/Project

        Filepath to the (unzipped) project folder or Project object.
    review_id: str
        Identifier of the review from which the state will be instantiated.
        If none is given, the first review in the reviews folder will be taken.
    create_new: bool
        If True, a new state file is created.

    Returns
    -------
    SQLiteState
    """

    # Unzip the ASReview data if needed.
    if isinstance(asreview_obj, Project):
        project = asreview_obj
    elif zipfile.is_zipfile(asreview_obj) and Path(asreview_obj).suffix == ".asreview":
        # work from a temp dir
        tmpdir = tempfile.TemporaryDirectory()
        project = Project.load(asreview_obj, tmpdir.name)
    elif isinstance(asreview_obj, (Path, str)) and not Path(asreview_obj).is_dir():
        raise ProjectNotFoundError(
            f"Directory {asreview_obj} is not a valid ASReview project."
        )
    elif is_project(asreview_obj):
        project = Project(asreview_obj)
    else:
        raise ProjectError("Unknown project type.")

    # init state class
    state = SQLiteState()

    try:
        if len(project.reviews) > 0:
            if review_id is None:
                review_id = project.config["reviews"][0]["id"]
            logging.debug(f"Opening review {review_id}.")
            state._restore(project.project_path, review_id)
        elif create_new and len(project.reviews) == 0:
            review_id = uuid4().hex
            logging.debug(f"Create new review (state) with id {review_id}.")
            state._create_new_state_file(project.project_path, review_id)
            project.add_review(review_id)
        else:
            raise StateNotFoundError("State does not exist in the project")
        yield state
    finally:
        try:
            state.close()
        except AttributeError:
            # file seems to be closed, do nothing
            pass
