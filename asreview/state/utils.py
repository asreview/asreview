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

from pathlib import Path

from asreview.state.errors import StateNotFoundError

V3STATE_VERSION = "1.0"


def is_zipped_project_file(fp):
    """Check if it is a zipped asreview project file."""
    if Path(fp).is_file():
        state_ext = Path(fp).suffix

        if state_ext in ['.h5', '.hdf5', '.he5', '.json']:
            raise ValueError(
                f'State file with extension {state_ext} is no longer '
                f'supported. Migrate to the new format or '
                'use an older version of ASReview. See LINK.')
        elif state_ext == '.asreview':
            return True
        else:
            raise ValueError(f'State file extension {state_ext} is not '
                             f'recognized.')
    else:
        return False


def is_valid_project_folder(fp):
    """Check of the folder contains an asreview project."""
    if not Path(fp, 'reviews').is_dir() \
            or not Path(fp, 'feature_matrices').is_dir():
        raise StateNotFoundError(
            f"There does not seem to be a valid project folder at {fp}. The "
            f"'reviews' or 'feature_matrices' folder is missing.")
    else:
        return
