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
            rec_copy["authors"] = eval(rec_copy["authors"])
        except Exception:
            rec_copy["authors"] = []
        # print("For this record, authors:\n",rec_copy["authors"])

        # Check the keywords
        try:
            rec_copy["keywords"] = eval(rec_copy["keywords"])
        except Exception:
            rec_copy["keywords"] = []
        # print("For this record, keywords:\n", rec_copy["keywords"])

        # Check the notes
        try:
            rec_copy["notes"] = eval(rec_copy["notes"])
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
            else:
                rec_copy["notes"].append("ASReview_not_seen")
        # print("For this record, notes:\n", rec_copy["notes"])

        # Delete "included" column as it is 
        # not supported by the RIS standard
        # try:
        #     del rec_copy["included"]
        # except Exception:
        #     pass

        # Delete "asreview_ranking" column as it
        # is not supported by the RIS standard
        # try:
        #     del rec_copy["included"]
        # except Exception:
        #     pass

        # Append the deepcopied and updated record to a new array
        records_new.append(rec_copy)

    # print("Records to be sent to rispy are:\n", records_new)

    # From buffered dataframe
    if fp is None:
        # Export the RIS file from the buffer
        # return rispy.dumps(records_new, skip_unknown_tags=True)
        return rispy.dumps(records_new)

    # From IO dataframe
    else:
        # Export the RIS file on the path
        with open(fp, "w") as fp:
            # rispy.dump(records_new, fp, skip_unknown_tags=True)
            rispy.dump(records_new, fp)
