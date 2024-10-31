from pathlib import Path

from pytest import mark

from asreview import load_dataset


def test_write_data(tmpdir):
    fp_in = Path("tests", "demo_data", "generic_labels.csv")
    fp_out = Path(tmpdir, "generic_out.csv")
    asr_data = load_dataset(fp_in)
    asr_data.to_file(fp_out, labels=[[0, 0], [2, 1], [3, 1]])

    tmp_csv_fp_out = Path(tmpdir, "tmp_generic_labels.csv")
    asr_data.to_file(tmp_csv_fp_out)
    asr_data_diff = load_dataset(tmp_csv_fp_out)
    # Check if export file includes labels [1,0]
    assert list(asr_data["included"]) == list(asr_data_diff["included"])


@mark.parametrize("test_file", [("baseline_tag-notes_labels.ris")])
def test_asreview_labels_ris(test_file, tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
    asr_data = load_dataset(fp_in)

    tmp_ris_fp_out = Path(tmpdir, "tmp_labels.ris")
    asr_data.to_file(tmp_ris_fp_out)
    asr_data_diff = load_dataset(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data["title"]) == list(asr_data_diff["title"])
    assert list(asr_data["included"]) == list(asr_data_diff["included"])


@mark.parametrize("test_file", [("baseline_tag-notes.ris")])
def test_asreview_notes_ris(test_file, tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
    asr_data = load_dataset(fp_in)

    tmp_ris_fp_out = Path(tmpdir, "tmp_notes.ris")
    asr_data.to_file(tmp_ris_fp_out)

    asr_data_diff = load_dataset(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data["title"]) == list(asr_data_diff["title"])
    assert list(asr_data["notes"]) == list(asr_data_diff["notes"])


@mark.parametrize("test_file", [("ris_issue_992.txt"), ("ris_issue_1099.txt")])
def test_asreview_ris(test_file, tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
    asr_data = load_dataset(fp_in)

    tmp_ris_fp_out = Path(tmpdir, "tmp_ris.ris")
    asr_data.to_file(tmp_ris_fp_out)

    asr_data_diff = load_dataset(tmp_ris_fp_out)

    # Check if input file matches the export file
    assert list(asr_data["title"]) == list(asr_data_diff["title"])
