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

import pandas as pd
from asreview.io.utils import standardize_dataframe


def read_csv(data_fp):
    """CVS file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the CSV file.

    Returns
    -------
    list:
        List with entries.

    """

    for encoding in ["utf-8", "ISO-8859-1"]:
        try:
            df = pd.read_csv(
                data_fp,
                sep=None,
                encoding=encoding,
                engine='python'
            )
            return standardize_dataframe(df)
        except UnicodeDecodeError:
            # if unicode error, go to next encoding
            continue

    raise UnicodeDecodeError("The encoding of the file is not supported.")
