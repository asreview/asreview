from pathlib import Path

import asreview as asr


def test_json_logger():

    log_fp = Path("test", "log_files", "test_1_inst.json")

    with asr.Logger.from_file(str(log_fp)) as logger:
        assert isinstance(logger, asr.json_logging.JSON_Logger)


def test_hdf5_logger():
    log_fp = Path("test", "log_files", "test_1_inst.h5")
    with asr.Logger.from_file(str(log_fp)) as logger:
        assert isinstance(logger, asr.hdf5_logging.HDF5_Logger)
