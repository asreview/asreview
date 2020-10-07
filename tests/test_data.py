from pathlib import Path
import urllib

import numpy as np
from pytest import mark

from asreview import ASReviewData
from asreview.datasets import DatasetManager


def exists(url):
    return urllib.request.urlopen(url).getcode() == 200


@mark.parametrize("keywords,paper_id", [
    ("bronchogenic duplication cyst", 0),
    ("diagnositc accuracy microscopy female priority", 1),
    ("immunophenotiping", 4),
    ("Foregut report embryoogenesis", 4),
    ("Liu Adler", 0),
    ("Khoury cysts", 4),
    ("Isolated Edwards", 5),
    ("Kwintanilla-djeck Neck", 3),
    ("Cancer case computer contrast pancreatomy Yamada", 2),
])
def test_fuzzy_finder(keywords, paper_id):
    fp = Path("tests", "demo_data", "embase.csv")
    as_data = ASReviewData.from_file(fp)

    assert as_data.fuzzy_find(keywords)[0] == paper_id


@mark.parametrize("data_name", [
    "ptsd",
    "ace",
    "hall",
])
def test_datasets(data_name):
    data = DatasetManager().find(data_name)
    assert exists(data.get())


def test_bad_record_id():
    data_fp = Path("tests", "demo_data", "generic_bad_record_id.csv")
    as_data = ASReviewData.from_file(data_fp)
    assert(len(np.unique(as_data.df.index.values)) == len(as_data))
