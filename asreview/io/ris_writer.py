# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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


def write_ris(df, fp):
    """RIS file writer.

    Parameters
    ----------
    df: pandas.Dataframe
        Dataframe to convert and export.
    fp: str, pathlib.Path
        File path to the RIS file, if exists.

    Returns
    -------
    rispy.dumps:
        Dataframe with entries is written into buffer.
    rispy.dump:
        Dataframe with entries is written into a file.
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
