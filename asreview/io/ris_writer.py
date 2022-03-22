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

import copy

import pandas as pd
import rispy


class RISWriter():
    """RIS file writer.
    """

    name = "ris"
    label = "RIS"
    caution = "Available only if you imported a RIS file when creating the project"
    write_format = ".ris"

    @classmethod
    def write_data(cls, df, fp, labels=None, ranking=None):
        """Export dataset.

        Arguments
        ---------
        df: pandas.Dataframe
            Dataframe of all available record data.
        fp: str, pathlib.Path
            File path to the RIS file, if exists.
        labels: list, numpy.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        RIS file
            Dataframe of all available record data.
        """

        # Turn pandas DataFrame into records (list of dictionaries) for rispy
        records = df.to_dict('records')

        # Create an array for storing modified records
        records_new = []

        # Iterate over all available records
        for rec in records:

            # Store the record as a deepcopy
            rec_copy = copy.deepcopy(rec)

            # Iterate over all the items for the deepcopied record
            for k, v in rec_copy.items():
                # Find all items with a value
                if not isinstance(v, list) and pd.isnull(v):
                    # Assign the value to the key
                    rec_copy[k] = v

            # Check the "authors" - AU
            try:
                rec_copy["authors"] = eval(rec_copy["authors"])
            except Exception:
                rec_copy["authors"] = []

            # Check the "keywords" - KW
            try:
                rec_copy["keywords"] = eval(rec_copy["keywords"])
            except Exception:
                rec_copy["keywords"] = []

            # Check the "notes" - N1
            try:
                rec_copy["notes"] = eval(str(rec_copy["notes"]))
            except Exception:
                rec_copy["notes"] = []

            # Update "notes" column based on the "included" column label
            finally:
                # Relevant records
                if "included" in rec_copy and rec_copy["included"] == 1:
                    rec_copy["notes"].append("ASReview_relevant")
                # Irrelevant records
                elif "included" in rec_copy and rec_copy["included"] == 0:
                    rec_copy["notes"].append("ASReview_irrelevant")
                # Not seen records
                elif "included" in rec_copy and rec_copy["included"] == -1:
                    rec_copy["notes"].append("ASReview_not_seen")
                else:
                    rec_copy["notes"].append("ASReview_not_seen")

            # Append the deepcopied and updated record to a new array
            records_new.append(rec_copy)

        # From buffered dataframe
        if fp is None:
            # Write the whole content to buffer
            return rispy.dumps(records_new)

        # From IO dataframe
        else:
            # Write the whole content to a file
            with open(fp, "w", encoding="utf8") as fp:
                rispy.dump(records_new, fp)
