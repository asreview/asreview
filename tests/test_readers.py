from pathlib import Path
from urllib.request import urlretrieve

import pytest
import rispy
from pytest import mark

from asreview import load_dataset
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
        pytest.param("https://osf.io/download/fg93a/", 38, [], marks=mark.internet_required),
    ],
)
def test_reader(test_file, n_lines, ignore_col):
    if _is_url(test_file):
        fp = test_file
    else:
        fp = Path("tests", "demo_data", test_file)

    as_data = load_dataset(fp)
    assert len(as_data) == n_lines

    cols = ["title", "abstract", "authors", "keywords"]
    cols = [col for col in cols if col not in ignore_col]
    # if labels is not None:
    #     cols.append('included')
    #     assert np.array_equal(as_data.labels, labels)

    for col in cols:
        values = as_data.get(col)
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
    as_data = load_dataset(fp)
    assert as_data.record(record_i).included == included


def test_multiline_tags_ris():
    fp = Path("tests", "demo_data", "baseline_tag_and_field_definitions_lists.ris")
    entries = rispy.load(fp, encoding="utf-8")
    assert entries[0]["notes"] == ["Notes 1", "Notes 2"]


def test_nan_values_ris():
    fp = Path("tests", "demo_data", "baseline_empty_values.ris")
    as_data = load_dataset(fp)

    # Check missing titles
    assert as_data.record(1).title is None
    assert as_data.record(3).title is None

    # Check missing abstracts
    assert as_data.record(0).abstract is None
    assert as_data.record(2).abstract is None

    # Check missing authors
    assert as_data.record(0).authors is None
    assert as_data.record(2).authors is None

    # Check missing keywords
    assert as_data.record(0).keywords is None
    assert as_data.record(2).keywords is None

    # Check missing notes
    assert as_data.record(0).notes is None
    assert as_data.record(2).notes is None

    # check missing doi
    assert as_data.record(0).doi is None
    assert as_data.record(2).doi is None

    # check is_prior
    assert not as_data.record(0).is_prior
    assert not as_data.record(2).is_prior


def test_nan_values_csv():
    fp = Path("tests", "demo_data", "missing_values.csv")
    as_data = load_dataset(fp)

    # Check missing titles
    assert as_data.record(1).title is None
    assert as_data.record(3).title is None

    # Check missing abstracts
    assert as_data.record(0).abstract is None
    assert as_data.record(2).abstract is None

    # Check missing authors
    assert as_data.record(0).authors is None
    assert as_data.record(2).authors is None

    # Check missing keywords
    assert as_data.record(0).keywords is None
    assert as_data.record(2).keywords is None

    # Check missing doi
    assert as_data.record(0).doi is None
    assert as_data.record(2).doi is None


def test_asreview_labels_prior():
    fp = Path("tests", "demo_data", "baseline_tag-notes_labels.ris")
    as_data = load_dataset(fp)
    assert as_data.record(0).is_prior
    assert as_data.record(1).is_prior
    assert not as_data.record(2).is_prior
    assert not as_data.record(3).is_prior

    assert as_data.is_prior().sum() == 2


def test_write_data(tmpdir):
    fp_in = Path("tests", "demo_data", "generic_labels.csv")
    fp_out = Path(tmpdir, "generic_out.csv")
    asr_data = load_dataset(fp_in)
    asr_data.to_file(fp_out, labels=[[0, 0], [2, 1], [3, 1]])

    tmp_csv_fp_out = Path(tmpdir, "tmp_generic_labels.csv")
    asr_data.to_file(tmp_csv_fp_out)
    asr_data_diff = load_dataset(tmp_csv_fp_out)
    # Check if export file includes labels [1,0]
    assert list(asr_data.labels) == list(asr_data_diff.labels)


@mark.internet_required
def test_load_dataset_from_url(tmpdir):
    url = "https://zenodo.org/api/records/1162952/files/Hall.csv/content"

    urlretrieve(url, tmpdir / "Hall.csv")
    as_data = load_dataset(tmpdir / "Hall.csv")
    assert len(as_data) == 8911
