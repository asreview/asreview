from pathlib import Path

from pytest import mark
import numpy as np

from asreview import ASReviewData


@mark.parametrize("test_file,n_lines,labels,ignore_col", [
    ("embase.csv", 6, None, ["keywords"]),
    ("embase_newpage.csv", 6, None, ["keywords"]),
    ("embase.ris", 6, None, []),
    ("generic.csv", 2, None, []),
    ("generic_semicolon.csv", 2, None, []),
    ("generic_tab.csv", 2, None, []),
    ("generic_tab.tab", 2, None, []),
    ("generic_tab.tsv", 2, None, []),
    ("generic_labels.csv", 6, [1, 0, 1, 0, 1, 0], []),
    ("generic.ris", 2, None, []),
    ("generic_labels.ris", 2, [1, 0], []),
    ("pubmed_zotero.ris", 6, None, []),
    ("pubmed_endnote.txt", 6, None, []),
    ("scopus.ris", 6, None, []),
    ("ovid_zotero.ris", 6, None, []),
    ("proquest.ris", 6, None, []),
    ("pubmed.xml", 10, None, []),
])
def test_reader(test_file, n_lines, labels, ignore_col):
    fp = Path("tests", "demo_data", test_file)
    as_data = ASReviewData.from_file(fp)
    assert len(as_data) == n_lines

    cols = ['title', 'abstract', 'authors', 'keywords']
    cols = [col for col in cols if col not in ignore_col]
    if labels is not None:
        cols.append('included')
        assert np.array_equal(as_data.labels, labels)

    for col in cols:
        values = as_data.get(col)
        assert len(values) == n_lines


def test_nan_values_ris():

    fp = Path("tests", "demo_data", "missing_values.ris")
    as_data = ASReviewData.from_file(fp)

    # check missing titles
    assert as_data.record(1, by_index=True).title == ""
    assert as_data.record(3, by_index=True).title == ""

    # check missing abstracts
    assert as_data.record(0, by_index=True).abstract == ""
    assert as_data.record(2, by_index=True).abstract == ""


def test_nan_values_csv():

    fp = Path("tests", "demo_data", "missing_values.csv")
    as_data = ASReviewData.from_file(fp)

    # check missing titles
    assert as_data.record(1, by_index=True).title == ""
    assert as_data.record(3, by_index=True).title == ""

    # check missing abstracts
    assert as_data.record(0, by_index=True).abstract == ""
    assert as_data.record(2, by_index=True).abstract == ""


def test_csv_write_data():
    fp_in = Path("tests", "demo_data", "generic_labels.csv")
    fp_out = Path("tests", "out_data", "generic_out.csv")
    asr_data = ASReviewData.from_file(fp_in)
    asr_data.to_csv(fp_out, labels=[[0, 0], [2, 1], [3, 1]])


def test_ris_write_data(tmpdir):
    fp_in = Path("tests", "demo_data", "generic_labels.ris")
    asr_data = ASReviewData.from_file(fp_in)

    tmp_ris_fp_out = Path(tmpdir, "tmp_generic_labels.ris")
    asr_data.to_ris(tmp_ris_fp_out)

    asr_data_diff = ASReviewData.from_file(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data.title) == list(asr_data_diff.title)
    assert list(asr_data.labels) == list(asr_data_diff.labels)
    
    # Check if export file includes labels [1,0]
    assert list(asr_data_diff.labels) == [1,0]

    # Break for debugging
    # assert False