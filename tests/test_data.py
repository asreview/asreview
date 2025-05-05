import urllib
from pathlib import Path

import pandas as pd
from pytest import mark

import asreview as asr
from asreview import load_dataset
from asreview.data.search import fuzzy_find
from asreview.data.utils import duplicated
from asreview.datasets import DatasetManager


def exists(url):
    return urllib.request.urlopen(url).getcode() == 200


@mark.parametrize(
    "keywords,record_id",
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
def test_fuzzy_finder(keywords, record_id):
    fp = Path("tests", "demo_data", "embase.csv")
    dataset = load_dataset(fp)
    assert fuzzy_find(dataset, keywords)[0] == record_id


@mark.internet_required
@mark.parametrize(
    "data_name",
    [
        "synergy:Menon_2022",
        "synergy:Meijboom_2021",
    ],
)
def test_datasets(data_name):
    data = DatasetManager().find(data_name)
    assert data.dataset_id == data_name[8:]


@mark.xfail(reason="Deduplication will be reimplemented.")
def test_duplicate_count():
    data = asr.load_dataset(Path("tests", "demo_data", "duplicate_records.csv"))

    assert int(data.df.duplicated("doi").sum()) == 2


def test_deduplication():
    d_dups = asr.load_dataset(Path("tests", "demo_data", "duplicate_records.csv"))

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

    pd.testing.assert_series_equal(duplicated(d_dups), s_dups_bool, check_index=False)


def test_duplicated():
    data = pd.DataFrame(
        {
            "doi": [
                "https://www.doi.org/10.1000/xyz",
                "https://www.doi.org/10.1000/abc",
                "https://www.doi.org/10.1000/xyz",
                "https://www.doi.org/10.1000/XYZ",
                "10.1000/xyz",
                "10.1000/xyz",
                "http://www.doi.org/10.1000/xyz",
                "https://doi.org/10.1000/xyz",
            ],
            "title": ["T1", "T2", "T3", "T3", "T4", "T1", "T2", "T3"],
            "abstract": ["A1", "A2", "A3", "A3", "A4", "A1", "A2", "A3"],
        }
    )

    # Call the function and get the result
    result = duplicated(data)

    # Check the result
    assert result.equals(pd.Series([False, False, True, True, True, True, True, True]))


def test_duplicated_empty_pid():
    data = pd.DataFrame(
        {
            "title": ["T1", "T2", "T3", "T4", "T5", "T6"],
            "abstract": ["A1", "A2", "A3", "A4", "A5", "A6"],
            "doi": [None, None, None, None, None, None],
        }
    )

    result = duplicated(data, pid=None)
    assert result.equals(pd.Series([False, False, False, False, False, False]))


def test_duplicated_all_empty():
    data = pd.DataFrame(
        {
            "title": ["", "", "", "", "", ""],
            "abstract": ["", "", "", "", "", ""],
            "doi": [None, None, None, None, None, None],
        }
    )

    result = duplicated(data)
    assert result.equals(pd.Series([False, False, False, False, False, False]))
