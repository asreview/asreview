from pathlib import Path

import pandas as pd
import pytest

from asreview.data.loader import _get_reader
from asreview.data.loader import _get_writer

# # This test used to be in test_readers.py. I'm not entirely sure what is being tested.
# def test_write_data(tmpdir):
#     fp_in = Path("tests", "demo_data", "generic_labels.csv")
#     fp_out = Path(tmpdir, "generic_out.csv")
#     asr_data = load_dataset(fp_in)
#     asr_data.to_file(fp_out, labels=[[0, 0], [2, 1], [3, 1]])

#     tmp_csv_fp_out = Path(tmpdir, "tmp_generic_labels.csv")
#     asr_data.to_file(tmp_csv_fp_out)
#     asr_data_diff = load_dataset(tmp_csv_fp_out)
#     # Check if export file includes labels [1,0]
#     assert list(asr_data["included"]) == list(asr_data_diff["included"])


@pytest.mark.parametrize(
    "test_file,columns",
    [
        ("ris_issue_992.txt", ["title"]),
        ("ris_issue_1099.txt", ["primary_title"]),
        ("baseline_tag-notes.ris", ["title", "notes"]),
        ("baseline_tag-notes_labels.ris", ["title", "included"]),
    ],
)
def test_asreview_ris(test_file, columns, tmpdir):
    fp_in = Path("tests", "demo_data", test_file)
    data = _get_reader(fp_in).read_data(fp_in)
    if "included" in data:
        data["asreview_label"] = data["included"]

    tmp_ris_fp_out = Path(tmpdir, "tmp.ris")
    _get_writer(tmp_ris_fp_out).write_data(data, tmp_ris_fp_out)
    written_data = _get_reader(tmp_ris_fp_out).read_data(tmp_ris_fp_out)

    for col in columns:
        pd.testing.assert_series_equal(data[col], written_data[col])
