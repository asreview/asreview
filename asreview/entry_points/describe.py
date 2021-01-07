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

import argparse
import json
import logging

from asreview.entry_points import BaseEntryPoint

from asreview.data import ASReviewData
from asreview.data import describe_data
from asreview.data import format_describe_data


class DescribeEntryPoint(BaseEntryPoint):
    description = "Describe data, state, and ASReview files."

    def execute(self, argv):
        logging.getLogger().setLevel(logging.ERROR)
        version_name = f"{self.extension_name}: {self.version}"
        parser = _parse_arguments(version=version_name)
        args = parser.parse_args(argv)

        try:
            data = ASReviewData.from_file(args.path)

            if args.output_data is None:
                formatted_data = format_describe_data(data)

                # print result
                print(f"************  {args.path}  ************\n")
                print(formatted_data, "\n")
            else:
                describe_dict = describe_data(data)
                with open(args.output_data, "w") as fp:
                    json.dump(describe_dict, fp)

        except Exception as err:
            raise err


def _parse_arguments(version="?"):
    parser = argparse.ArgumentParser(prog='asreview describe')
    parser.add_argument(
        'path',
        metavar='PATH',
        type=str,
        help='Data, state, or ASReview file.'
    )
    parser.add_argument(
        "--output_data",
        default=None,
        type=str,
        help="Export the results to a JSON file."
    )
    return parser
