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

import rispy
import pandas as pd
import copy as cp


def write_ris(df, fp):
    """RIS file writer
    Parameters
    ----------
    df: pandas.Dataframe
        Dataframe to convert and export.
    fp: str, pathlib.Path
        File path to the RIS file, if exists.
    """
    # # Choose only "included" records
    # df = df[df.included.astype('str').str.contains('1')]

    # print("Writer DF is:\n",df[["authors","keywords","included"]])
    # Turn pandas DataFrame into records (list of dictionaries) for rispy
    records = df.to_dict('records')
    # print("records are:\n", records)

    ########################################################
    # For each record, update and verify RIS list type tags:
    # AU - authors
    # KW - keywords
    # N1 - notes
    ########################################################

    # Create an array for storing modified records
    records_new = []

    # Iterate over all available records
    for rec in records:

        # Create a list to store the deepcopied record
        rec_copy = {}

        # Store the record as a deepcopy
        rec_copy = cp.deepcopy(rec)

        # Iterate over all the items for the deepcopied record
        for k,v in rec_copy.items():
            # Find all items with a value
            if not pd.isnull(v):
                # Assign the value to the key
                rec_copy[k] = v

        # Check the authors
        try:
            records[i]["authors"] = eval(records[i]["authors"])
        except Exception:
            records[i]["authors"] = []
        # print("For this record, authors:\n",records[i]["authors"])

        # Check the keywords
        try:
            records[i]["keywords"] = eval(records[i]["keywords"])
        except Exception:
            records[i]["keywords"] = []
        # print("For this record, keywords:\n", records[i]["keywords"])

        # Check the notes
        try:
            records[i]["notes"] = eval(records[i]["notes"])
        except Exception:
            records[i]["notes"] = []
        # Update notes based on the label
        finally:
            # Relevant records
            if records[i]["included"] == 1:
                records[i]["notes"].append("ASReview_relevant")
            # Irelevant records
            elif records[i]["included"] == 0:
                records[i]["notes"].append("ASReview_irrelevant")
            # Not seen records
            else:
                records[i]["notes"].append("ASReview_not_seen")
        # print("For this record, notes:\n", records[i]["notes"])

    # Buffered dataframe
    if fp is None:
        # Export the RIS file from the buffer
        return rispy.dumps(records)
    # IO dataframe
    else:
        # Export the RIS file on the path
        with open(fp, "w") as fp:
            rispy.dump(records, fp)
