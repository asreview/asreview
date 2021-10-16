from pathlib import Path

from pytest import mark
import numpy as np
import rispy

from asreview import ASReviewData

def test_ris_write_data(test_file,tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
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
