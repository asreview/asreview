from pathlib import Path

import asreview as asr


def test_json_logger():

    log_fp = Path("test", "log_files", "test_1_inst.json")

    with asr.JSON_Logger(str(log_fp)) as logger:
        assert isinstance(logger, asr.JSON_Logger)


def test_hdf5_logger():
    log_fp = Path("test", "log_files", "test_1_inst.h5")
    with asr.HDF5_Logger(str(log_fp)) as logger:
        assert isinstance(logger, asr.HDF5_Logger)
