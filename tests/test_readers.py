from pathlib import Path
from urllib.request import urlretrieve

import pytest
import rispy
from pytest import mark

from asreview import load_dataset
from asreview.utils import _is_url
from asreview.data.loader import _from_file


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
    # if labels is not None:
    #     cols.append('included')
    #     assert np.array_equal(as_data.labels, labels)

    for col in cols:
        values = [getattr(record, col) for record in records]
        assert len(values) == n_lines


@mark.parametrize(
    "record_i,included",
    [
        # Single line record
        (0, 1),
        (1, 0),
        (2, -1),
        (3, -1),
        # Single line record with additional notes, label first
        (4, 1),
        (5, 0),
        (6, -1),
        # Single line record with additional notes, label in the middle
        (7, 1),
        (8, 0),
        (9, -1),
        # Single line record with additional notes, label last
        (10, 1),
        (11, 0),
        (12, -1),
        # Multiline record, label first
        (13, 1),
        (14, 0),
        (15, -1),
        # Multiline record, label in the middle
        (16, 1),
        (17, 0),
        (18, -1),
        # Multiline record, label last
        (19, 1),
        (20, 0),
        (21, -1),
        # Multiline record, with additional notes, label first
        (22, 1),
        (23, 0),
        (24, -1),
        # Multiline record, with additional notes, label in the middle
        (25, 1),
        (26, 0),
        (27, -1),
        # Multiline record, with additional notes, label last
        (28, 1),
        (29, 0),
        (30, -1),
        # No notes tag present
        (31, -1),
    ],
)
def test_asreview_labels_ris(record_i, included):
    fp = Path("tests", "demo_data", "baseline_tag-notes_labels.ris")
    records = _from_file(fp)
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

    # Check missing notes
    assert records[0].notes is None
    assert records[2].notes is None

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
def test_load_dataset_from_url(tmpdir):
    url = "https://zenodo.org/api/records/1162952/files/Hall.csv/content"

    urlretrieve(url, tmpdir / "Hall.csv")
    as_data = load_dataset(tmpdir / "Hall.csv")
    assert len(as_data) == 8911


@pytest.mark.skip()
@pytest.mark.parametrize(
    "dataset_fp", Path("..", "citation-file-formatting", "Datasets", "RIS").glob("*")
)
def test_real_datasets(dataset_fp):
    data = load_dataset(dataset_fp)
    assert len(data) > 5
