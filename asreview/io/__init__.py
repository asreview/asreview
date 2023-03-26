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


from .csv_reader import CSVReader
from .csv_writer import CSVWriter
from .excel_reader import ExcelReader
from .excel_writer import ExcelWriter
from .paper_record import PaperRecord
from .ris_reader import RISReader
from .ris_writer import RISWriter
from .tsv_writer import TSVWriter
from .utils import list_readers
from .utils import list_writers


__all__ = [
    "CSVReader",
    "CSVWriter",
    "ExcelReader",
    "ExcelWriter",
    "PaperRecord",
    "RISReader",
    "RISWriter",
    "TSVWriter",
    "list_readers",
    "list_writers",
    "tsv_writer",
    "ris_writer",
    "ris_reader",
    "paper_record",
    "excel_writer",
    "excel_reader",
    "csv_writer",
    "csv_reader",
    "utils"
]

for _item in dir():
    if not _item.endswith('__'):
        assert _item in __all__, f"Named export {_item} missing from __all__ in {__package__}"
del _item
