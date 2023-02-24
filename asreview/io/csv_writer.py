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

class CSVWriter():
    """CSV file writer.
    """

    name = "csv"
    label = "CSV (UTF-8)"
    write_format = ".csv"

    @classmethod
    def write_data(cls, df, fp, sep=",", labels=None, ranking=None):
        """Export dataset.

        Arguments
        ---------
        df: pandas.Dataframe
            Dataframe of all available record data.
        fp: str, NoneType
            Filepath or None for buffer.
        sep: str
            Seperator of the file.
        labels: list, numpy.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        CSV file
            Dataframe of all available record data.
        """
        return df.to_csv(fp, sep=sep, index=True)
