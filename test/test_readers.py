
from pathlib import Path

from pytest import mark

import asreview as asr
from asreview.readers import ASReviewData


@mark.parametrize(
    "test_file,n_lines,labels,ignore_col",
    [
        ("embase.csv", 6, None, []),
        ("embase.ris", 6, None, []),
        ("generic.csv", 2, None, []),
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
    fp = Path("test", "demo_data", test_file)
    as_data = asr.ASReviewData.from_file(fp)
    assert as_data.raw_df.shape[0] == n_lines

    cols = ['title', 'abstract', 'authors', 'article_id']
    cols = [col for col in cols if col not in ignore_col]
    if labels is not None:
        cols.append('labels')
        for i in range(n_lines):
            assert as_data.labels[i] == labels[i]

    for col in cols:
        print(col)
        assert len(getattr(as_data, col)) == n_lines


def test_csv_write_data():
    fp_in = Path("test", "demo_data", "generic_labels.csv")
    fp_out = Path("test", "out_data", "generic_out.csv")
    asr_data = ASReviewData.from_file(fp_in)
    asr_data.to_csv(fp_out, labels=[0, 1, 0, 1, 0, 1])
