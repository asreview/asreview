import urllib
from pathlib import Path

import pandas as pd
from pytest import mark

import asreview
from asreview.data.base import ASReviewData
from asreview.data.statistics import n_duplicates
from asreview.datasets import DatasetManager
from asreview.search import fuzzy_find


def exists(url):
    return urllib.request.urlopen(url).getcode() == 200


@mark.parametrize(
    "keywords,paper_id",
    [
        ("bronchogenic duplication cyst", 0),
        ("diagnositc accuracy microscopy female priority", 1),
        ("immunophenotiping", 4),
        ("Foregut report embryoogenesis", 4),
        ("Liu Adler", 0),
        ("Khoury cysts", 4),
        ("Isolated Edwards", 5),
        ("Kwintanilla-djeck Neck", 3),
        ("Cancer case computer contrast pancreatomy Yamada", 2),
    ],
)
def test_fuzzy_finder(keywords, paper_id):
    fp = Path("tests", "demo_data", "embase.csv")
    as_data = asreview.ASReviewData.from_file(fp)

    assert fuzzy_find(as_data, keywords)[0] == paper_id


@mark.parametrize(
    "data_name",
    [
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
    ],
)
def test_datasets(data_name):
    data = DatasetManager().find(data_name)
    assert exists(data.filepath)


def test_duplicate_count():
    d = ASReviewData.from_file(Path("tests", "demo_data", "duplicate_records.csv"))

    assert n_duplicates(d) == 2


def test_deduplication():
    d_dups = ASReviewData.from_file(Path("tests", "demo_data", "duplicate_records.csv"))

    s_dups_bool = pd.Series(
        [
            False,
            True,
            False,
            True,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
            False,
        ]
    )

    # test whether .duplicated() provides correct boolean series for duplicates
    pd.testing.assert_series_equal(d_dups.duplicated(), s_dups_bool, check_index=False)

    d_nodups = ASReviewData(
        pd.DataFrame(
            {
                "title": ["a", "b", "d", "e", "f", "g", "h", "i", "", "", "   ", "   "],
                "abstract": [
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "",
                    "",
                    "   ",
                    "   ",
                ],
                "doi": [
                    "10.1",
                    "10.3",
                    None,
                    None,
                    "   ",
                    "   ",
                    None,
                    None,
                    "10.4",
                    "10.5",
                    "10.6",
                    "10.7",
                ],
                "some_column": [
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                ],
            }
        )
    )

    # test whether .drop_duplicates() drops the duplicated records correctly
    pd.testing.assert_frame_equal(d_dups.drop_duplicates(), d_nodups.df)
