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

from asreview.data.statistics import n_records
from asreview.data.statistics import n_included
from asreview.data.statistics import n_excluded
from asreview.data.statistics import n_unlabeled
from asreview.data.statistics import n_missing_title
from asreview.data.statistics import n_missing_abstract
from asreview.data.statistics import title_length
from asreview.data.statistics import abstract_length
from asreview.data.statistics import n_keywords


def describe_data(data):
    """Compute dataset statisticsg.

    Returns
    -------
    dict:
        Output the statistics to a dict.
    """
    _n_missing_title, _n_missing_title_included = n_missing_title(data)
    _n_missing_abs, _n_missing_abs_included = n_missing_abstract(data)

    return {
        "n_records": n_records(data),
        "n_relevant": n_included(data),
        "n_irrelevant": n_excluded(data),
        "n_unlabeled": n_unlabeled(data),
        "n_missing_title": _n_missing_title,
        "n_missing_title_relevant": _n_missing_title_included,
        "n_missing_abstract": _n_missing_abs,
        "n_missing_abstract_relevant": _n_missing_abs_included,
        "title_length": title_length(data),
        "abstract_length": abstract_length(data),
        "n_keywords": n_keywords(data),
    }


def format_describe_data(data):
    """Format the dataset statistics to string.

    Returns
    -------
    str:
        Output with datasets to string.
    """
    values = describe_data(data)
    if values['n_keywords'] is not None:
        avg_keywords = f"{values['n_keywords']:.1f}"
    else:
        avg_keywords = None
    values_str = (
        f"Number of records:           {values['n_records']}\n"
        f"Number of relevant:          {values['n_relevant']} "
        f"({100*values['n_relevant']/values['n_records']:.2f}%)\n"
        f"Number of irrelevant:        {values['n_irrelevant']} "
        f"({100*values['n_irrelevant']/values['n_records']:.2f}%)\n"
        f"Number of unlabeled:         {values['n_unlabeled']} "
        f"({100*values['n_unlabeled']/values['n_records']:.2f}%)\n"
        f"Average title length:        {values['title_length']:.0f}\n"
        f"Average abstract length:     {values['abstract_length']:.0f}\n"
        f"Average number of keywords:  {avg_keywords}\n"
        f"Number of missing titles:    {values['n_missing_title']}"
    )
    if values['n_missing_title_relevant'] is not None:
        values_str += (f" (of which {values['n_missing_title_relevant']}"
                       " relevant)")
    values_str += (f"\nNumber of missing abstracts: "
                   f"{values['n_missing_abstract']}")
    if values['n_missing_abstract_relevant'] is not None:
        val = values['n_missing_abstract_relevant']
        values_str += (f" (of which {val} relevant)")
    values_str += "\n"
    return values_str
