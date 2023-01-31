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

import logging
import os
import pickle
from pathlib import Path

import pandas as pd

from asreview._version import get_versions
from asreview.data import ASReviewData


class CacheDataError(Exception):
    pass


def _get_cache_data_path(fp_data):

    return Path(fp_data).with_suffix(fp_data.suffix + ".pickle")


def _read_data_from_cache(fp_data, version_check=True):

    fp_data_pickle = _get_cache_data_path(fp_data)

    try:
        # get the pickle data
        with open(fp_data_pickle, "rb") as f_pickle_read:
            data_obj, data_obj_version = pickle.load(f_pickle_read)

        # validate data object
        if not isinstance(data_obj.df, pd.DataFrame):
            raise ValueError()

        # drop cache files generated by older versions
        if (not version_check) or (get_versions()["version"] == data_obj_version):
            return data_obj

    except FileNotFoundError:
        # file not available
        pass
    except Exception as err:
        # problem loading pickle file or outdated
        # remove the pickle file
        logging.error(f"Error reading cache file: {err}")
        try:
            os.remove(fp_data_pickle)
        except FileNotFoundError:
            pass

    raise CacheDataError()


def _write_data_to_cache(fp_data, data_obj):

    fp_data_pickle = _get_cache_data_path(fp_data)

    logging.info("Store a copy of the data in a pickle file.")
    with open(fp_data_pickle, "wb") as f_pickle:
        pickle.dump((data_obj, get_versions()["version"]), f_pickle)


def read_data(project, use_cache=True, save_cache=True):
    """Get ASReviewData object from file.

    Parameters
    ----------
    project_path: str, iterable
        The project identifier.
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
        fp_data = Path(project.project_path, "data", project.config["dataset_path"])
    except Exception:
        raise FileNotFoundError("Dataset not found")

    # use cache file
    if use_cache:
        try:
            return _read_data_from_cache(fp_data)
        except CacheDataError:
            pass

    # load from file
    data_obj = ASReviewData.from_file(fp_data)

    # save a pickle version
    if save_cache:
        _write_data_to_cache(fp_data, data_obj)

    return data_obj
