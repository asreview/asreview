# Copyright 2019-2023 The ASReview Authors. All Rights Reserved.
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


def convert_to_custom_metadata_str(tags=None):
    return json.dumps({"tags": tags})


def extract_tags(custom_metadata_str):
    if not isinstance(custom_metadata_str, str):
        return None

    obj = json.loads(custom_metadata_str)

    if "tags" in obj:
        return obj["tags"]
    else:
        return None


def get_tag_composite_id(group_id, tag_id):
    return f"{group_id}:{tag_id}"
