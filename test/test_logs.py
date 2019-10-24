from pathlib import Path

import asreview as asr


def test_json_logger():

    log_fp = Path("test", "demo_data", "logs", "test.json")

    with asr.JSONLogger(str(log_fp)) as logger:
        assert isinstance(logger, asr.JSONLogger)


def test_hdf5_logger():
    log_fp = Path("test", "demo_data", "logs", "test.h5")
    with asr.HDF5_Logger(str(log_fp)) as logger:
        assert isinstance(logger, asr.HDF5_Logger)
