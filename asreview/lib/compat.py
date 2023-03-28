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


def convert_id_to_idx(data_obj, record_id):
    """Convert record_id to row number."""

    inv_record_id = dict(zip(data_obj.df.index.tolist(), range(len(data_obj))))

    result = []
    for i in record_id:
        try:
            result.append(inv_record_id[i])
        except KeyError:
            raise KeyError(f"record_id {i} not found in data.")

    return result
