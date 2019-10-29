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


def check_label_methods(label_methods, n_labels, methods):
    assert len(label_methods) == n_labels
    for method in label_methods:
        assert method in methods


def check_log(logger):

    check_label_methods(logger.get("label_methods", 0), 4, ["initial"])
    check_label_methods(logger.get("label_methods", 1), 1, ["max", "random"])

    assert len(logger.get("labelled", 0)) == 4
    assert len(logger.get("labelled", 1)) == 1

    assert len(logger.get("train_idx", 1)) == 4
    assert len(logger.get("pool_idx", 1)) == 2

    assert len(logger.get("labels")) == 6

    assert logger.n_queries() == 2
