import urllib
from pathlib import Path

import pandas as pd
from pytest import mark

import asreview
from asreview.data.statistics import n_duplicates
from asreview.data.base import ASReviewData
from asreview.datasets import DatasetManager
from asreview.search import fuzzy_find


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
    as_data = asreview.ASReviewData.from_file(fp)

    assert fuzzy_find(as_data, keywords)[0] == paper_id


@mark.parametrize("data_name", [

    # datasets from the datasets repo
    "benchmark:van_de_Schoot_2017",
    "benchmark:Hall_2012",
    "benchmark:Cohen_2006_ACEInhibitors",
    "benchmark:Bos_2018",

    # datasets from the Van de Schoot et al. paper
    # https://github.com/asreview/paper-asreview/blob/master/index_v1.json
    "benchmark-nature:van_de_Schoot_2017",
    "benchmark-nature:Hall_2012",
    "benchmark-nature:Cohen_2006_ACEInhibitors",
    "benchmark-nature:Kwok_2020",
])
def test_datasets(data_name):
    data = DatasetManager().find(data_name)
    assert exists(data.filepath)


def test_data_statistics():
    d = asreview.ASReviewData(
        pd.DataFrame({
            "title": ["a", "a", "b", "c", "d", "e", "f", "g", "h", "i"],
            "abstract": ["lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem"],
            "doi": ["10.1", "", "10.3", "10.3", "", "", "   ", "   ", None, None]
        })
    )

    assert n_duplicates(d) == 2


def test_data_base():
    d_dups = ASReviewData(
        pd.DataFrame({
            "title": ["a", "a", "b", "c", "d", "e", "f", "g", "h", "i"],
            "abstract": ["lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem"],
            "doi": ["10.1", "", "10.3", "10.3", "", "", "   ", "   ", None, None]
        })
    )

    d_nodups = ASReviewData(
        pd.DataFrame({
            "title": ["a", "b", "d", "e", "f", "g", "h", "i"],
            "abstract": ["lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem", "lorem"],
            "doi": ["10.1", "10.3", "", "", "   ", "   ", None, None]
        })
    )

    d_removed_dups = ASReviewData(
        pd.DataFrame({
            "title": ["a", "c"],
            "abstract": ["lorem", "lorem"],
            "doi": ["10.2", "10.3"]
        })
    )

    pd.testing.assert_frame_equal(d_dups.drop_duplicates().df, d_nodups.df)

    pd.testing.assert_frame_equal(d_dups.duplicated(), d_removed_dups.df)
