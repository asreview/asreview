import urllib
from pathlib import Path

import pandas as pd
from pytest import mark

import asreview as asr
from asreview.data import DataStore
from asreview.datasets import DatasetManager
from asreview.search import fuzzy_find


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
def test_fuzzy_finder(tmpdir, keywords, record_id):
    fp = Path("tests", "demo_data", "embase.csv")
    records = asr.load_dataset(fp, dataset_id="foo")
    data_store = DataStore(Path(tmpdir, "store.db"))
    data_store.create_tables()
    data_store.add_records(records)

    assert fuzzy_find(data_store, keywords)[0] == record_id


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


@mark.xfail(reason="Deduplication will be reimplemented.")
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

    # test whether .duplicated() provides correct boolean series for duplicates
    pd.testing.assert_series_equal(d_dups.duplicated(), s_dups_bool, check_index=False)

    d_nodups = asr.Dataset(
        pd.DataFrame(
            {
                "title": [
                    "a",
                    "b",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                    "i",
                    None,
                    None,
                    "   ",
                    "   ",
                ],
                "abstract": [
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    "lorem",
                    None,
                    None,
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
    pd.testing.assert_frame_equal(d_dups.drop_duplicates().df, d_nodups.df)


@mark.xfail(reason="Deduplication will be reimplemented.")
def test_duplicated():
    # Create an instance of Dataset
    instance = asr.Dataset(
        pd.DataFrame(
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
    )

    # Call the function and get the result
    result = instance.duplicated()

    # Check the result
    assert result.equals(pd.Series([False, False, True, True, True, True, True, True]))
