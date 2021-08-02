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

def write_ris(df, fp):
    """RIS file writer
    Parameters
    ----------
    df: pandas.Dataframe
        Dataframe to convert and export.
    fp: str, pathlib.Path
        File path to the RIS file, if exists. 
    """
    print("df 3:", df)
    # # Check for the 'notes' column and
    # # turn DF label into 'notes'
    # if "notes" in list(df):
    #     df["notes"] = df["notes"] + " " + df[col_label].replace({0: "ASReview_irrelevant", 1: 'ASReview_relevant'})
    # else:
    #     df["notes"] = df[col_label].replace({0: "ASReview_irrelevant", 1: 'ASReview_relevant'})

    # # Delete the col_label
    # del df[col_label]

    # Only relevant records
    df = df[df.included.astype('str').str.contains('1')]

    # Turn pandas DataFrame into list of dictionaries
    d = df.T.to_dict().values()

    # Buffered dataframe
    if fp is None:
        return rispy.dumps(d)
    # IO dataframe
    else:
        # Export the RIS file
        with open(fp, "w") as fp:
            rispy.dump(d, fp)