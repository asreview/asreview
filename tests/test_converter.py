from pathlib import Path

import h5py

from asreview.state.utils import convert_h5_to_v3
from asreview.state.utils import convert_json_to_v3


def test_h5_converter_basic(tmpdir):
    conv_state_fp = Path(tmpdir, 'test.h5')
    state_fp = Path("tests", "state_files", "test.h5")
    convert_h5_to_v3(conv_state_fp, state_fp, basic=True)


def test_json_converter(tmpdir):
    conv_state_fp = Path(tmpdir, 'test.h5')
    state_fp = Path("tests", "state_files", "test.json")
    convert_json_to_v3(conv_state_fp, state_fp, basic=True)


