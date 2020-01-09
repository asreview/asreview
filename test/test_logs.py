import os
from pathlib import Path

import numpy as np

from asreview.logging import JSONLogger, HDF5Logger, DictLogger
from asreview import open_logger
from asreview.settings import ASReviewSettings


def test_read_json_logger():

    log_fp = Path("test", "log_files", "test_1_inst.json")

    with open_logger(str(log_fp)) as logger:
        assert isinstance(logger, JSONLogger)


def test_read_hdf5_logger():
    log_fp = Path("test", "log_files", "test_1_inst.h5")
    with open_logger(str(log_fp)) as logger:
        assert isinstance(logger, HDF5Logger)


def test_read_dict_logger():
    with open_logger(None) as logger:
        assert isinstance(logger, DictLogger)


def test_write_json_logger(tmpdir):
    check_write_logger(tmpdir, 'test.json')


def test_write_hdf5_logger(tmpdir):
    check_write_logger(tmpdir, 'test.h5')


def test_write_dict_logger(tmpdir):
    check_write_logger(tmpdir, None)


def check_write_logger(tmpdir, log_file):
    if log_file is not None:
        log_fp = os.path.join(tmpdir, log_file)
    else:
        log_fp = None

    settings = ASReviewSettings(mode="simulate", model="nb",
                                query_strategy="rand_max",
                                balance_strategy="simple",
                                feature_extraction="tfidf")

    n_records = 6
    n_half = int(n_records/2)
    start_labels = np.full(n_records, np.nan, dtype=np.int)
    labels = np.zeros(n_records, dtype=np.int)
    labels[::2] = np.ones(n_half, dtype=np.int)
    methods = np.full((n_records), "initial")
    methods[2::] = np.full((int(n_records-2)), "random")
    methods[2::2] = np.full((int((n_records-2)/2)), "max")

    with open_logger(log_fp) as logger:
        logger.add_settings(settings)
        logger.set_labels(start_labels)
        current_labels = np.copy(start_labels)
        for i in range(n_records):
            query_i = int(i/2)
            proba = None
            if i >= 2 and (i % 2) == 0:
                proba = np.random.rand(n_records)
            logger.add_classification([i], [labels[i]], [methods[i]], query_i)
            if proba is not None:
                logger.add_proba(np.arange(i+1, n_records), np.arange(i+1),
                                 proba, query_i)
            current_labels[i] = labels[i]
            logger.set_labels(current_labels)
            check_logger(logger, i, query_i, labels, methods, proba)


def check_logger(logger, label_i, query_i, labels, methods, proba):
    n_records = len(labels)

    log_labels = logger.get("labels")
    assert len(log_labels) == len(labels)
    for i in range(label_i+1):
        assert log_labels[i] == labels[i]
    for i in range(label_i+1, n_records):
        assert log_labels[i] == np.full(1, np.nan, dtype=np.int)[0]

    result_dict = logger.to_dict()
    cur_i = 0
    for qi in range(query_i+1):
        res = result_dict["results"][qi]
        max_i = cur_i + len(res["label_methods"])
        for j in range(len(res["label_methods"])):
            assert res["label_methods"][j] == methods[j+cur_i]
        assert np.all(res["label_idx"] == np.arange(cur_i, max_i))
        assert np.all(res["inclusions"] == labels[cur_i:max_i])
        cur_i = max_i

    if proba is not None:
        res = result_dict["results"][query_i]
        assert np.all(res["proba"] == proba)
        assert np.all(res["pool_idx"] == list(range(label_i+1, n_records)))
        assert np.all(res["train_idx"] == list(range(0, label_i+1)))
