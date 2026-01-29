from pathlib import Path

import pandas as pd
import pytest

from asreview.data.loader import _get_reader
from asreview.data.loader import _get_writer


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
