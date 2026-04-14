import sqlite3
from pathlib import Path

import pandas as pd
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Mapped

from asreview.data.loader import load_dataset
from asreview.data.loader import load_records
from asreview.data.record import Base
from asreview.data.record import Record
from asreview.data.utils import _clean_text
from asreview.data.utils import identify_groups
from asreview.data.utils import identify_record_groups
from asreview.database.store import SQLITE_MAX_VARIABLE_NUMBER
from asreview.database.store import DataStore
from asreview.project.api import Project


@pytest.fixture
def records():
    data_fp = Path("tests", "demo_data", "generic.csv")
    return load_records(data_fp, dataset_id="foo")


@pytest.fixture
def store(tmpdir):
    fp = tmpdir / Project.PATH_DB
    store = DataStore(fp)
    store.create_tables()
    return store


@pytest.fixture
def store_with_data(store, records):
    store.add_records(records)
    return store


def test_create_tables(tmpdir):
    fp = tmpdir / Project.PATH_DB
    store = DataStore(fp)
    store.create_tables()
    con = sqlite3.connect(fp)
    tables = (
        con.cursor()
        .execute("SELECT name FROM sqlite_master WHERE type='table'")
        .fetchone()
    )
    assert tables == ("record",)


def test_add_dataset(store, records):
    store.add_records(records)
    con = sqlite3.connect(store.fp)
    df = pd.read_sql("SELECT * FROM record", con)
    assert df["dataset_id"].eq("foo").all()


def test_record_id_start_at_zero(store):
    store.add_records(
        [
            Record(dataset_id="foo", dataset_row=5),
            Record(dataset_id="foo", dataset_row=6),
        ]
    )
    assert store["record_id"].to_list() == [0, 1]


def test_is_empty(store, records):
    assert store.is_empty()
    store.add_records(records)
    assert not store.is_empty()


def test_get_records(store, records):
    store.add_records(records)
    row_number = 1
    record = store.get_records(row_number)
    assert isinstance(record, Record)
    assert record.record_id == row_number
    all_records = store.get_records()
    assert len(all_records) == len(records)


def test_get_df(store_with_data):
    output = store_with_data.get_df()
    assert isinstance(output, pd.DataFrame)
    assert set(output.columns) == set(Record.get_columns())


def test_len(store, records):
    assert len(store) == 0
    store.add_records(records)
    assert len(store) == len(records)


def test_get_column(store_with_data, records):
    abstracts = store_with_data["abstract"]
    assert isinstance(abstracts, pd.Series)
    abstracts = store_with_data[["abstract"]]
    assert isinstance(abstracts, pd.DataFrame)
    assert abstracts.columns == ["abstract"]
    for i in range(len(records)):
        assert abstracts.loc[i, "abstract"] == records[i].abstract

    data = store_with_data[["title", "record_id"]]
    assert isinstance(data, pd.DataFrame)
    assert list(data.columns) == ["title", "record_id"]


def test_custom_record(tmpdir):
    class CustomRecord(Base):
        __tablename__ = "custom"
        foo: Mapped[str]

    fp = Path(tmpdir, Project.PATH_DB)
    data_store = DataStore(fp, CustomRecord)
    data_store.create_tables()


def test_close_store(tmpdir):
    fp = Path(tmpdir, Project.PATH_DB)
    data_store = DataStore(fp)
    data_store.create_tables()
    fp.unlink()


def test_dataset_row_id_unique(store):
    records = [
        Record(dataset_row=1, dataset_id="foo"),
        Record(dataset_row=1, dataset_id="foo"),
    ]
    with pytest.raises(IntegrityError):
        store.add_records(records)


def test_author_validation(store):
    records = [
        Record(dataset_id="foo", dataset_row=1, authors=None),
        Record(dataset_id="foo", dataset_row=2, authors=["Foo", "Bar"]),
    ]
    store.add_records(records)
    with pytest.raises(ValueError):
        store.add_records([Record(dataset_id="foo", dataset_row=3, authors="Foo;Bar")])


def test_keyword_validation(store):
    records = [
        Record(dataset_id="foo", dataset_row=1, keywords=None),
        Record(dataset_id="foo", dataset_row=2, keywords=["Foo", "Bar"]),
    ]
    store.add_records(records)
    with pytest.raises(ValueError):
        store.add_records([Record(dataset_id="foo", dataset_row=3, keywords="Foo;Bar")])


def test_label_validation(store):
    records = [
        Record(dataset_id="foo", dataset_row=1, included=None),
        Record(dataset_id="foo", dataset_row=2, included=1),
        Record(dataset_id="foo", dataset_row=3, included=0),
    ]
    store.add_records(records)
    with pytest.raises(ValueError):
        store.add_records([Record(dataset_id="foo", dataset_row=4, included="1")])


def test_delete_record(store):
    record = Record(dataset_id="foo", dataset_row=1)
    store.add_records([record])
    assert len(store) == 1
    store.delete_record(record.record_id)
    assert len(store) == 0


def test_load_dataset_no_abstracts(tmpdir):
    test_fp = tmpdir / "no_abstracts.csv"
    df = pd.DataFrame(
        {
            "title": ["Title 1", "Title 2"],
            "authors": ["Author A", "Author B"],
            "abstract": [None, None],
        }
    )
    df.to_csv(test_fp, index=False)
    db = load_dataset(test_fp, dataset_id="foo")

    assert db.input.get_df()["abstract"].replace("", None).isnull().all()


@pytest.mark.parametrize(
    "file_name,n_lines",
    [
        ("_baseline.ris", 100),
        ("embase.csv", 6),
        ("embase_newpage.csv", 6),
        ("embase.ris", 6),
        ("generic.csv", 2),
        ("generic_semicolon.csv", 2),
        ("generic_tab.csv", 2),
        ("generic_tab.tab", 2),
        ("generic_tab.tsv", 2),
        ("generic_labels.csv", 6),
        ("pubmed_zotero.ris", 6),
        ("pubmed_endnote.txt", 6),
        ("scopus.ris", 6),
        ("ovid_zotero.ris", 6),
        ("proquest.ris", 6),
        ("web_of_science.txt", 10),
    ],
)
def test_load_dataset(file_name, n_lines):
    fp = Path("tests", "demo_data", file_name)
    with load_dataset(fp, dataset_id=file_name) as db:
        assert len(db.input) == n_lines


@pytest.mark.internet_required
def test_load_dataset_from_url(osf_fg93a_path):
    store = load_dataset(osf_fg93a_path, dataset_id="osf_fg93a")
    assert len(store.input) == 38


def test_dataset_with_record_ids():
    fp = Path("tests", "demo_data", "record_id.csv")
    db = load_dataset(fp)
    record_ids = db.input["record_id"]
    assert record_ids.to_list() == list(range(len(db.input)))


def test_load_faulty_year_dataset():
    # The dataset contains one record with the value '10 15' as publication year.
    with pytest.raises(ValueError):
        load_dataset(Path("tests", "demo_data", "faulty_year.ris"))


@pytest.mark.parametrize(
    "groups, normalized_chain",
    [
        ([(0, 0)], {0: None, 1: None, 2: None, 3: None}),
        ([(0, 0), (0, 1)], {0: None, 1: 0, 2: None, 3: None}),
        ([(0, 0), (0, 2), (1, 1)], {0: None, 1: None, 2: 0, 3: None}),
        ([(3, 0), (1, 1), (1, 2), (3, 3)], {0: None, 1: None, 2: 1, 3: 0}),
    ],
)
def test_set_groups(store, groups, normalized_chain):
    records = [Record(dataset_row=idx, dataset_id="foo") for idx in range(4)]
    store.add_records(records)
    store.set_groups(groups)
    stored_duplicate_chain = {
        record.record_id: record.duplicate_of for record in store.get_records()
    }
    assert stored_duplicate_chain == normalized_chain


@pytest.mark.parametrize(
    "groups",
    [
        [(0, 0), (1, 1), (2, 2), (3, 3)],
        [(0, 0), (0, 1), (2, 2), (3, 3)],
        [(0, 0), (0, 2), (0, 3), (1, 1)],
        [(0, 0), (0, 2), (1, 1), (1, 3)],
        [(0, 0), (0, 1), (0, 2), (0, 3)],
    ],
)
def test_get_groups(store, groups):
    records = [Record(dataset_row=idx, dataset_id="foo") for idx in range(len(groups))]
    store.add_records(records)
    store.set_groups(groups)
    stored_groups = store.get_groups()
    assert stored_groups == groups

    for group_id, record_id in groups:
        group_members = set((g_id, r_id) for (g_id, r_id) in groups if g_id == group_id)
        assert group_members == set(store.get_groups(record_id=record_id))


@pytest.mark.parametrize(
    "groups, result",
    [
        ([], [(0, 0), (1, 1), (2, 2), (3, 3)]),
        ([(0, 0), (0, 1)], [(0, 0), (0, 1), (2, 2), (3, 3)]),
        ([(0, 0), (0, 2), (0, 3)], [(0, 0), (0, 2), (0, 3), (1, 1)]),
    ],
)
def test_get_groups_partial_data(store, groups, result):
    records = [Record(dataset_row=idx, dataset_id="foo") for idx in range(4)]
    store.add_records(records)
    store.set_groups(groups)
    stored_groups = store.get_groups()
    assert stored_groups == result

    for group_id, record_id in result:
        group_members = set((g_id, r_id) for (g_id, r_id) in result if g_id == group_id)
        assert group_members == set(store.get_groups(record_id=record_id))


@pytest.mark.parametrize(
    "input_data,expected",
    [
        # No duplicates
        (["a", "b", "c"], [(0, 0), (1, 1), (2, 2)]),
        # Simple duplicate
        (["a", "b", "a"], [(0, 0), (1, 1), (0, 2)]),
        # Multiple duplicates of same element
        (["x", "x", "x"], [(0, 0), (0, 1), (0, 2)]),
        # Mix of unique and duplicate
        (["a", "b", "a", "c", "b"], [(0, 0), (1, 1), (0, 2), (3, 3), (1, 4)]),
        # Integers instead of strings
        ([1, 2, 3, 1, 2], [(0, 0), (1, 1), (2, 2), (0, 3), (1, 4)]),
        # Empty iterable
        ([], []),
    ],
)
def test_identify_groups(input_data, expected):
    assert identify_groups(input_data) == expected


@pytest.mark.parametrize(
    "records, record_ids, feature_extractors, expected",
    [
        # Case 1: identical titles <E2><86><92> grouped
        (
            [
                Record("ds1", 1, title="A"),
                Record("ds1", 2, title="A"),
                Record("ds1", 3, title="B"),
            ],
            [0, 1, 2],
            [lambda r: r.title],
            [(0, 0), (0, 1), (2, 2)],
        ),
        # Case 2: use dataset_id and dataset_row <E2><86><92> all unique
        (
            [
                Record("ds1", 1, title="A"),
                Record("ds1", 2, title="A"),
                Record("ds1", 3, title="A"),
            ],
            [4, 2, 7],
            [lambda r: r.dataset_id, lambda r: r.dataset_row],
            # All unique <E2><86><92> group id = record id
            [(4, 4), (2, 2), (7, 7)],
        ),
        # Case 3: two different groups by DOI
        (
            [
                Record("ds1", 1, doi="x"),
                Record("ds1", 2, doi="y"),
                Record("ds1", 3, doi="x"),
            ],
            [3, 4, 5],
            [lambda r: r.doi],
            # First and third same group
            [(3, 3), (4, 4), (3, 5)],
        ),
    ],
)
def test_identify_record_groups(records, record_ids, feature_extractors, expected):
    for record, record_id in zip(records, record_ids):
        record.record_id = record_id
    result = identify_record_groups(records, feature_extractors)
    assert set(result) == set(expected)


def test_load_dataset_grouped(tmpdir):
    # Create a ris file that contains another dataset twice.
    with open(Path("tests", "demo_data", "pubmed_zotero.ris")) as f:
        file_text = f.read()
    duplicate_fp = Path(tmpdir, "duplicate_test.ris")
    # duplicate_fp = Path("tests", "demo_data", "duplicated_dataset.ris")
    with open(duplicate_fp, "w") as f:
        f.write(file_text + "\n\n" + file_text)

    db = load_dataset(duplicate_fp)
    # The original dataset has 6 records, so this one has 12.
    assert len(db.input) == 12
    # There should be six groups, each containing the original record and the duplicated
    # record six row lower.
    groups = db.input.get_groups()
    assert set(groups) == set((i, i) for i in range(6)).union(
        set((i, i + 6) for i in range(6))
    )


@pytest.mark.parametrize(
    "text,expected",
    [
        # Empty / falsy inputs
        ("", ""),
        (None, ""),
        # Lowercasing
        ("Machine Learning", "machinelearning"),
        # Whitespace removal
        ("  hello   world  ", "helloworld"),
        ("hello\tworld\n", "helloworld"),
        # Punctuation removal
        ("self-report", "selfreport"),
        ("title: a study.", "titleastudy"),
        # Accented characters normalized via NFKD
        ("café", "cafe"),
        ("naïve résumé", "naiveresume"),
        # Unicode dashes normalized (em-dash, en-dash)
        ("self\u2014report", "selfreport"),
        ("self\u2013report", "selfreport"),
        # Ligatures expanded via NFKD
        ("\ufb01nding", "finding"),
        # Mixed
        ("  Héllo,  Wörld!  ", "helloworld"),
    ],
)
def test_clean_text(text, expected):
    assert _clean_text(text) == expected


def test_identify_record_groups_default_extractors():
    """Test that the default extractors detect duplicates despite whitespace,
    case, punctuation, and accent differences."""
    records = [
        Record("ds1", 0, title="Machine Learning", abstract="An abstract."),
        Record("ds1", 1, title="machine  learning", abstract="an abstract"),
        Record("ds1", 2, title="MACHINE-LEARNING", abstract="An Abstract!"),
        Record("ds1", 3, title="café study", abstract="some abstract"),
        Record("ds1", 4, title="cafe study", abstract="some abstract"),
        Record("ds1", 5, title="unique title", abstract="unique abstract"),
    ]
    for i, record in enumerate(records):
        record.record_id = i

    result = identify_record_groups(records)

    # First three records should be in one group (group_id=0).
    # "café study" and "cafe study" should be in another group (group_id=3).
    # "unique title" should be its own group.
    assert set(result) == {(0, 0), (0, 1), (0, 2), (3, 3), (3, 4), (5, 5)}


@pytest.fixture
def large_store(tmpdir):
    n = SQLITE_MAX_VARIABLE_NUMBER + 100
    fp = tmpdir / Project.PATH_DB
    store = DataStore(fp)
    store.create_tables()
    records = [Record(dataset_row=i, dataset_id="foo") for i in range(n)]
    store.add_records(records)
    return store


def test_get_records_exceeding_variable_limit(large_store):
    n = SQLITE_MAX_VARIABLE_NUMBER + 100
    record_ids = list(range(n))
    records = large_store.get_records(record_ids)
    assert len(records) == n
    assert [r.record_id for r in records] == record_ids


def test_set_groups_exceeding_variable_limit(large_store):
    n = SQLITE_MAX_VARIABLE_NUMBER + 100
    groups = [(i // 2, i) for i in range(n)]
    large_store.set_groups(groups)
    stored_groups = large_store.get_groups()
    assert len(stored_groups) == n


def test_column_reads_aligned_with_duplicates(store):
    """Separate single-column reads must align positionally.

    Once duplicates exist, SQLite picks the `idx_record_group_id` covering index
    for `SELECT record_id FROM record` and returns rows in group_id order, while
    `SELECT included FROM record` still scans in rowid order. Without an
    explicit ORDER BY in `DataStore`, the two Series would misalign and any
    caller that joins them positionally would associate labels with the wrong
    records.
    """
    records = [
        Record(dataset_row=i, dataset_id="foo", title=f"t{i}", included=None)
        for i in range(5)
    ] + [
        Record(dataset_row=5 + i, dataset_id="foo", title=f"t{i}", included=i % 2)
        for i in range(5)
    ]
    store.add_records(records)
    # Groups that collapse records 5..9 onto the representatives 0..4. This is
    # exactly what `identify_record_groups` would produce for duplicate titles.
    store.set_groups([(i, i) for i in range(5)] + [(i, 5 + i) for i in range(5)])

    record_id = store["record_id"]
    included = store["included"]

    assert record_id.is_monotonic_increasing
    assert record_id.to_list() == list(range(10))
    assert included.to_list()[:5] == [pd.NA] * 5
    assert included.to_list()[5:] == [0, 1, 0, 1, 0]

    # Separate reads must also align with a combined read.
    combined = store[["record_id", "included"]]
    assert combined["record_id"].to_list() == record_id.to_list()
    assert combined["included"].to_list() == included.to_list()


def test_get_df_sorted_by_record_id_with_duplicates(store):
    """`get_df` must return rows in record_id order even when duplicates exist."""
    records = [
        Record(dataset_row=i, dataset_id="foo", title="same") for i in range(6)
    ]
    store.add_records(records)
    store.set_groups([(0, 0), (0, 1), (0, 2), (3, 3), (3, 4), (3, 5)])

    df = store.get_df()
    assert df["record_id"].is_monotonic_increasing
    assert df["record_id"].to_list() == list(range(6))
