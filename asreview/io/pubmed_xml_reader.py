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

import pandas as pd
import xml.etree.ElementTree as ET
from asreview.io.utils import standardize_dataframe


def read_pubmed_xml(fp):
    """PubMed XML file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the XML file (.xml).

    Returns
    -------
    list:
        List with entries.
    """
    tree = ET.parse(fp)
    root = tree.getroot()

    records = []
    for child in root:
        parts = []
        elem = child.find('MedlineCitation/Article/ArticleTitle')
        title = elem.text.replace('[', '').replace(']', '')

        for elem in child.iter('AbstractText'):
            parts.append(elem.text)
        authors = []
        for author in child.iter('Author'):
            author_elems = []
            for elem in author.iter('ForeName'):
                author_elems.append(elem.text)
            for elem in author.iter('LastName'):
                author_elems.append(elem.text)
            authors.append(" ".join(author_elems))

        author_str = ", ".join(authors)
        abstract = " ".join(parts)

        keyword_list = [keyword.text for keyword in child.iter('Keyword')]
        keywords = ", ".join(keyword_list)

        new_record = {
            "abstract": abstract,
            "title": title,
            "authors": author_str,
            "keywords": keywords,
        }
        records.append(new_record)
    return standardize_dataframe(pd.DataFrame(records))
