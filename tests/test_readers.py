from pathlib import Path
from urllib.request import urlretrieve

import pytest
import rispy
from pytest import mark

from asreview.data.loader import _from_file
from asreview.data.loader import load_records
from asreview.data.ris import RISReader
from asreview.utils import _is_url


@mark.parametrize(
    "test_file,n_lines,ignore_col",
    [
        ("_baseline.ris", 100, []),
        ("embase.csv", 6, ["keywords"]),
        ("embase_newpage.csv", 6, ["keywords"]),
        ("embase.ris", 6, []),
        ("generic.csv", 2, []),
        ("generic_semicolon.csv", 2, []),
        ("generic_tab.csv", 2, []),
        ("generic_tab.tab", 2, []),
        ("generic_tab.tsv", 2, []),
        ("generic_labels.csv", 6, []),
        ("pubmed_zotero.ris", 6, []),
        ("pubmed_endnote.txt", 6, []),
        ("scopus.ris", 6, []),
        ("ovid_zotero.ris", 6, []),
        ("proquest.ris", 6, []),
        ("web_of_science.txt", 10, []),
        pytest.param(
            "https://osf.io/download/fg93a/", 38, [], marks=mark.internet_required
        ),
    ],
)
def test_reader(test_file, n_lines, ignore_col):
    if _is_url(test_file):
        fp = test_file
    else:
        fp = Path("tests", "demo_data", test_file)

    records = _from_file(fp)
    assert len(records) == n_lines

    cols = ["title", "abstract", "authors", "keywords"]
    cols = [col for col in cols if col not in ignore_col]

    for col in cols:
        values = [getattr(record, col) for record in records]
        assert len(values) == n_lines


@mark.parametrize(
    "record_i,included",
    [
        # Single line record
        (0, 1),
        (1, 0),
        (2, None),
        (3, None),
        # Single line record with additional notes, label first
        (4, 1),
        (5, 0),
        (6, None),
        # Single line record with additional notes, label in the middle
        (7, 1),
        (8, 0),
        (9, None),
        # Single line record with additional notes, label last
        (10, 1),
        (11, 0),
        (12, None),
        # Multiline record, label first
        (13, 1),
        (14, 0),
        (15, None),
        # Multiline record, label in the middle
        (16, 1),
        (17, 0),
        (18, None),
        # Multiline record, label last
        (19, 1),
        (20, 0),
        (21, None),
        # Multiline record, with additional notes, label first
        (22, 1),
        (23, 0),
        (24, None),
        # Multiline record, with additional notes, label in the middle
        (25, 1),
        (26, 0),
        (27, None),
        # Multiline record, with additional notes, label last
        (28, 1),
        (29, 0),
        (30, None),
        # No notes tag present
        (31, None),
    ],
)
def test_asreview_labels_ris(record_i, included):
    fp = Path("tests", "demo_data", "baseline_tag-notes_labels.ris")
    records = _from_file(fp)

    print(records[record_i])

    if included is None:
        assert records[record_i].included is None
    else:
        assert records[record_i].included == included


def test_multiline_tags_ris():
    fp = Path("tests", "demo_data", "baseline_tag_and_field_definitions_lists.ris")
    entries = rispy.load(fp, encoding="utf-8")
    assert entries[0]["notes"] == ["Notes 1", "Notes 2"]


def test_nan_values_ris():
    fp = Path("tests", "demo_data", "baseline_empty_values.ris")
    records = _from_file(fp)

    # Check missing titles
    assert records[1].title is None
    assert records[3].title is None

    # Check missing abstracts
    assert records[0].abstract is None
    assert records[2].abstract is None

    # Check missing authors
    assert records[0].authors == []
    assert records[2].authors == []

    # Check missing keywords
    assert records[0].keywords == []
    assert records[2].keywords == []

    # check missing doi
    assert records[0].doi is None
    assert records[2].doi is None


def test_nan_values_csv():
    fp = Path("tests", "demo_data", "missing_values.csv")
    records = _from_file(fp)

    # Check missing titles
    assert records[1].title is None
    assert records[3].title is None

    # Check missing abstracts
    assert records[0].abstract is None
    assert records[2].abstract is None

    # Check missing authors
    assert records[0].authors == []
    assert records[2].authors == []

    # Check missing keywords
    assert records[0].keywords == []
    assert records[2].keywords == []

    # Check missing doi
    assert records[0].doi is None
    assert records[2].doi is None


@mark.internet_required
def test_load_records_from_url(tmpdir):
    url = "https://zenodo.org/api/records/1162952/files/Hall.csv/content"

    urlretrieve(url, tmpdir / "Hall.csv")
    records = load_records(tmpdir / "Hall.csv")
    assert len(records) == 8911


@pytest.mark.skip()
@pytest.mark.parametrize(
    "dataset_fp", Path("..", "citation-file-formatting", "Datasets", "RIS").glob("*")
)
def test_real_datasets(dataset_fp):
    data = load_records(dataset_fp)
    assert len(data) > 5


def test_ris_lb_tag(tmpdir):
    record = """TY  - JOUR
LB  - 1
TI  - This is the title
ER  -

TY  - JOUR
LB  - 0
TI  - This is the second title
ER  -

TY  - JOUR
LB  - 28362428
TI  - This is another title
ER  -
"""
    fp = Path(tmpdir, "lb_data.ris")
    with open(fp, "w") as f:
        f.write(record)

    records = RISReader.read_records(fp, dataset_id="foo")
    assert len(records) == 3
    for record in records:
        assert record.included is None


def test_ris_author_tags(tmpdir):
    record = """TY  - JOUR
AU  - author0
AU  - author1
AU  - author2
TI  - This is the title
ER  -

TY  - JOUR
A1  - author0
A1  - author1
A1  - author2
TI  - This is the second title
ER  -

TY  - JOUR
AU  - author0
A1  - author1
A1  - author2
TI  - This is another title
ER  -
"""
    fp = Path(tmpdir, "author_tags_data.ris")
    with open(fp, "w") as f:
        f.write(record)

    records = RISReader.read_records(fp, dataset_id="foo")
    for record in records:
        assert record.authors == ["author0", "author1", "author2"]
