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
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import pkg_resources

from asreview import __version__ as asreview_version
from asreview.config import LABEL_NA
from asreview.data import ASReviewData
from asreview.state.paths import get_data_file_path
from asreview.state.paths import get_labeled_path
from asreview.state.paths import get_pool_path
from asreview.webapp.utils.project_path import get_project_path
from asreview.utils import is_url


class CacheDataError(Exception):
    pass


def _get_cache_data_path(project_id):
    project_path = get_project_path(project_id)
    fp_data = get_data_file_path(project_path)

    return get_data_file_path(project_path) \
        .with_suffix(fp_data.suffix + ".pickle")


def _read_data_from_cache(project_id, version_check=True):

    fp_data_pickle = _get_cache_data_path(project_id)

    try:
        # get the pickle data
        with open(fp_data_pickle, 'rb') as f_pickle_read:
            data_obj, data_obj_version = pickle.load(f_pickle_read)

        # validate data object
        if not isinstance(data_obj.df, pd.DataFrame):
            raise ValueError()

        # drop cache files generated by older versions
        if (not version_check) or (asreview_version == data_obj_version):
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


def _write_data_to_cache(project_id, data_obj):

    fp_data_pickle = _get_cache_data_path(project_id)

    logging.info("Store a copy of the data in a pickle file.")
    with open(fp_data_pickle, 'wb') as f_pickle:
        pickle.dump((data_obj, asreview_version), f_pickle)


def read_data(project_id, use_cache=True, save_cache=True):
    """Get ASReviewData object from file.

    Parameters
    ----------
    project_id: str, iterable
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
    project_path = get_project_path(project_id)

    # use cache file
    if use_cache:
        try:
            return _read_data_from_cache(project_id)
        except CacheDataError:
            pass

    # load from file
    fp_data = get_data_file_path(project_path)
    data_obj = ASReviewData.from_file(fp_data)

    # save a pickle version
    if save_cache:
        _write_data_to_cache(project_id, data_obj)

    return data_obj


def data_reader_name(fp):

    if is_url(fp):
        path = urlparse(fp).path
    else:
        path = str(Path(fp).resolve())

    entry_points = {
        entry.name: entry
        for entry in pkg_resources.iter_entry_points('asreview.readers')
    }
    best_suffix = None
    for suffix, entry in entry_points.items():
        if path.endswith(suffix):
            if best_suffix is None or len(suffix) > len(best_suffix):
                best_suffix = suffix

    if best_suffix is None:
        raise ValueError(f"Error reading file {fp}, no capabilities for "
                         "reading such a file.")

    reader_name = entry_points[best_suffix].load().name

    return reader_name
