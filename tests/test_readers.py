from pathlib import Path

from pytest import mark
import numpy as np

from asreview import ASReviewData
# ToDo:
# 0. Make labeled RIS file, add to repo demo_data!!
# 0,5. Make different col fills for RIS files (no labels (labels == None),
#  partly labeled, incorrectly labeled (TypeError), uppercase/lowercase,
#  partly notes (no notes, multiple notes in one column, one note in one column,
#  multiple notes in all records), partly keywords)
# 1. Use labeled RIS file as input for int/rep test
# 2. Verify that int/rep of the read in file is indeed 0/1
# 2,5. debug if necessary in the reader
# 3. Move to testing RIS import/export circle
# 4. Use 1 labeled RIS file + 1 unlabeled RIS file for import/export circle
# 5.


@mark.parametrize("test_file,n_lines,ignore_col", [
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
    ("generic.ris", 2, []),
    ("generic_labels.ris", 2, []),
    ("pubmed_zotero.ris", 6, []),
    ("pubmed_endnote.txt", 6, []),
    ("scopus.ris", 6, []),
    ("ovid_zotero.ris", 6, []),
    ("proquest.ris", 6, [])
])
def test_reader(test_file, n_lines, ignore_col):
    fp = Path("tests", "demo_data", test_file)
    as_data = ASReviewData.from_file(fp)
    assert len(as_data) == n_lines

    cols = ['title', 'abstract', 'authors', 'keywords']
    cols = [col for col in cols if col not in ignore_col]
    # if labels is not None:
    #     cols.append('included')
    #     assert np.array_equal(as_data.labels, labels)

    for col in cols:
        values = as_data.get(col)
        assert len(values) == n_lines


@mark.parametrize("record_i,included", [
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
    # No notes tag present
    (22, -1)
])
def test_asreview_labels_ris(record_i, included):
    fp = Path("tests", "demo_data", "baseline_tag-notes_labels.ris")
    as_data = ASReviewData.from_file(fp)
    assert as_data.record(record_i, by_index=True).included == included


def test_nan_values_ris():

    fp = Path("tests", "demo_data", "baseline_empty_values.ris")
    as_data = ASReviewData.from_file(fp)

    # Check empty titles
    assert as_data.record(1, by_index=True).title == ""
    assert as_data.record(3, by_index=True).title == ""

    # Check empty abstracts
    assert as_data.record(0, by_index=True).abstract == ""
    assert as_data.record(2, by_index=True).abstract == ""

    # Check empty authors
    assert as_data.record(0, by_index=True).authors is None
    assert as_data.record(2, by_index=True).authors is None

    # Check empty keywords
    assert as_data.record(0, by_index=True).keywords is None
    assert as_data.record(2, by_index=True).keywords is None

    # Check empty notes
    assert as_data.record(0, by_index=True).notes is None
    assert as_data.record(2, by_index=True).notes is None

    # check empty doi
    assert as_data.record(0, by_index=True).doi is None
    assert as_data.record(2, by_index=True).doi is None


def test_nan_values_csv():

    fp = Path("tests", "demo_data", "missing_values.csv")
    as_data = ASReviewData.from_file(fp)

    # Check empty titles
    assert as_data.record(1, by_index=True).title == ""
    assert as_data.record(3, by_index=True).title == ""

    # Check empty abstracts
    assert as_data.record(0, by_index=True).abstract == ""
    assert as_data.record(2, by_index=True).abstract == ""

    # Check empty authors
    assert as_data.record(0, by_index=True).authors is None
    assert as_data.record(2, by_index=True).authors is None

    # Check empty keywords
    assert as_data.record(0, by_index=True).keywords is None
    assert as_data.record(2, by_index=True).keywords is None

    # Check empty doi
    assert as_data.record(0, by_index=True).doi is None
    assert as_data.record(2, by_index=True).doi is None


def test_csv_write_data(tmpdir):
    fp_in = Path("tests", "demo_data", "generic_labels.csv")
    fp_out = Path(tmpdir, "generic_out.csv")
    asr_data = ASReviewData.from_file(fp_in)
    asr_data.to_csv(fp_out, labels=[[0, 0], [2, 1], [3, 1]])

    tmp_csv_fp_out = Path("tmp_generic_labels.csv")
    asr_data.to_csv(tmp_csv_fp_out)
    asr_data_diff = ASReviewData.from_file(tmp_csv_fp_out)
    # Check if export file includes labels [1,0]
    assert list(asr_data.labels) == list(asr_data_diff.labels)


def test_ris_write_data(tmpdir):
    fp_in = Path("tests", "demo_data", "_baseline.ris")
    asr_data = ASReviewData.from_file(fp_in)

    # tmp_ris_fp_out = Path(tmpdir, "tmp_generic_labels.ris")
    tmp_ris_fp_out = Path("tmp_generic_labels.ris")
    asr_data.to_ris(tmp_ris_fp_out)

    asr_data_diff = ASReviewData.from_file(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data.title) == list(asr_data_diff.title)
    assert list(asr_data.abstract) == list(asr_data_diff.abstract)
    assert list(asr_data.authors) == list(asr_data_diff.authors)
    assert list(asr_data.keywords) == list(asr_data_diff.keywords)
    # assert list(asr_data.notes) == list(asr_data_diff.notes)
    assert list(asr_data.doi) == list(asr_data_diff.doi)

    # Check if export file includes labels [1,0]
    # assert list(asr_data_diff.labels) == [1,0]

    # Break for debugging
    # assert False
