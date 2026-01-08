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


def _get_state_path(asreview_obj):
    if isinstance(asreview_obj, Path) and asreview_obj.suffix == ".db":
        return asreview_obj
    elif isinstance(asreview_obj, Project):
        project = asreview_obj
    elif isinstance(asreview_obj, Path) and is_project(asreview_obj):
        project = Project(asreview_obj)
    else:
        raise ProjectNotFoundError(
            f"{asreview_obj} should be a project or the path to a project."
        )
    return Path(project.project_path, "results.db")


def _get_state(fp_state, create_new):
    if not fp_state.is_file():
        if create_new:
            fp_state.parent.mkdir(parents=True, exist_ok=True)
            state = SQLiteState(fp_state)
            state.create_tables()
        else:
            raise FileNotFoundError(f"No state file found at {fp_state}")
    else:
        state = SQLiteState(fp_state)
    return state


@contextmanager
def open_state(asreview_obj, create_new=True):
    """Initialize a state class instance from a project folder.

    Parameters
    ----------
    asreview_obj: str | Path | Project
        This can be one of:
            - a project instance
            - the path to a state file
            - the path to a zipped project folder
            - the path to a project folder
    create_new: bool
        If True, a new state file is created.

    Yields
    -------
    SQLiteState
    """
    if isinstance(asreview_obj, str):
        asreview_obj = Path(asreview_obj)

    state = None
    if (
        isinstance(asreview_obj, Path)
        and asreview_obj.is_file()
        and zipfile.is_zipfile(asreview_obj)
        and asreview_obj.suffix == ".asreview"
    ):
        with tempfile.TemporaryDirectory() as tmpdir:
            try:
                project = Project.load(asreview_obj, tmpdir)
                state = _get_state(
                    Path(project.project_path, "results.db"), create_new=create_new
                )
                yield state
            finally:
                if state is not None:
                    try:
                        state.close()
                    except AttributeError:
                        # file seems to be closed, do nothing
                        pass
    else:
        try:
            state = _get_state(_get_state_path(asreview_obj), create_new=create_new)
            yield state
        finally:
            if state is not None:
                try:
                    state.close()
                except AttributeError:
                    # file seems to be closed, do nothing
                    pass
