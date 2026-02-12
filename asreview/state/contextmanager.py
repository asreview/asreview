# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

import tempfile
import zipfile
from contextlib import contextmanager
from pathlib import Path

from asreview.project.api import Project
from asreview.project.api import is_project
from asreview.project.exceptions import ProjectNotFoundError
from asreview.state.sqlstate import SQLiteState


def _get_state_path(project, review_id=None, create_new=True):
    if review_id is None:
        if len(project.reviews) == 0:
            if not create_new:
                raise FileNotFoundError("State does not exist in the project")
            d_review = project.add_review()
            review_id = d_review["id"]
        else:
            review_id = project.reviews[0]["id"]

    return Path(project.project_path, "reviews", review_id, "results.db")


@contextmanager
def open_state(asreview_obj, review_id=None, create_new=True, check_integrety=False):
    """Initialize a state class instance from a project folder.

    Parameters
    ----------
    asreview_obj: str/pathlike/Project
        Filepath to the (unzipped) project folder or Project object.
    review_id: str
        Identifier of the review from which the state will be instantiated.
        If none is given, the first review in the reviews folder will be taken.
    create_new: bool
        If True, a new state file is created.
    check_integrety: bool
        If True, the integrity of the state file is checked. Default is False.

    Returns
    -------
    SQLiteState
    """

    if isinstance(asreview_obj, Project):
        fp_state = _get_state_path(
            asreview_obj, review_id=review_id, create_new=create_new
        )
    elif (
        isinstance(asreview_obj, (Path, str))
        and Path(asreview_obj).is_file()
        and zipfile.is_zipfile(asreview_obj)
        and Path(asreview_obj).suffix == ".asreview"
    ):
        tmpdir = tempfile.TemporaryDirectory()
        project = Project.load(asreview_obj, tmpdir.name)
        fp_state = _get_state_path(project, review_id=review_id, create_new=create_new)
    elif (
        isinstance(asreview_obj, (Path, str))
        and Path(asreview_obj).is_dir()
        and is_project(asreview_obj)
    ):
        fp_state = _get_state_path(
            Project(asreview_obj), review_id=review_id, create_new=create_new
        )
    elif isinstance(asreview_obj, (Path, str)) and Path(asreview_obj).suffix == ".db":
        fp_state = Path(asreview_obj)
    else:
        raise ProjectNotFoundError(f"{asreview_obj} is not a valid input for state")

    try:
        if create_new and not fp_state.is_file():
            fp_state.parent.mkdir(parents=True, exist_ok=True)
            state = SQLiteState(fp_state)
            state.create_tables()
        else:
            state = SQLiteState(fp_state)

        if check_integrety:
            state._is_valid_state()

        yield state

    finally:
        try:
            state.close()
        except AttributeError:
            # file seems to be closed, do nothing
            pass
