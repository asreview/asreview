from pathlib import Path

from pytest import mark

from asreview import ASReviewData


@mark.parametrize("test_file", [("baseline_tag-notes_labels.ris")])
def test_asreview_labels_ris(test_file, tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
    asr_data = ASReviewData.from_file(fp_in)

    tmp_ris_fp_out = Path(tmpdir, "tmp_labels.ris")
    asr_data.to_file(tmp_ris_fp_out)
    asr_data_diff = ASReviewData.from_file(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data.title) == list(asr_data_diff.title)
    assert list(asr_data.labels) == list(asr_data_diff.labels)


@mark.parametrize("test_file", [("baseline_tag-notes.ris")])
def test_asreview_notes_ris(test_file, tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
    asr_data = ASReviewData.from_file(fp_in)

    tmp_ris_fp_out = Path(tmpdir, "tmp_notes.ris")
    asr_data.to_file(tmp_ris_fp_out)

    asr_data_diff = ASReviewData.from_file(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data.title) == list(asr_data_diff.title)
    assert list(asr_data.notes) == list(asr_data_diff.notes)


@mark.parametrize("test_file", [("ris_issue_992.txt"), ("ris_issue_1099.txt")])
def test_asreview_ris(test_file, tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
    asr_data = ASReviewData.from_file(fp_in)

    tmp_ris_fp_out = Path(tmpdir, "tmp_ris.ris")
    asr_data.to_file(tmp_ris_fp_out)

    asr_data_diff = ASReviewData.from_file(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data.title) == list(asr_data_diff.title)


def test_write_numpy_arrays():
    # This test should catch cases where two numpy arrays
    # are to be evaluated in boolean context. Error is as follows:
    # "The truth value of an array with more than one element is ambiguous.
    # Use a.any() or a.all()"
    ###
    # For ris writer, a relevant bug was fixed with commit 70d9497
    pass
