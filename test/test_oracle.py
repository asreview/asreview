import os
from shutil import copyfile

from asreview.logging import Logger
from asreview.review.factory import get_reviewer

data_fp = os.path.join("test", "demo_data", "csv_example_with_labels.csv")
embedding_fp = os.path.join("test", "demo_data", "csv_example_with_labels.vec")
cfg_dir = os.path.join("test", "cfg_files")
log_dir = os.path.join("test", "log_files")
h5_log_file = os.path.join(log_dir, "test.h5")
json_log_file = os.path.join(log_dir, "test.json")


def test_log_continue_json(monkeypatch):
    inter_file = os.path.join(log_dir, "test_1_inst.json")
    if not os.path.isfile(inter_file):
        reviewer = get_reviewer(
            data_fp, mode="simulate", model="nb", embedding_fp=embedding_fp,
            prior_included=[1, 3], prior_excluded=[2, 4], log_file=inter_file,
            n_instances=1, n_queries=1)
        reviewer.review()

    copyfile(inter_file, json_log_file)
    check_model(monkeypatch, model="nb", log_file=json_log_file,
                continue_from_log=True, n_instances=1, n_queries=2)


def test_log_continue_h5(monkeypatch):
    inter_file = os.path.join(log_dir, "test_1_inst.h5")
    if not os.path.isfile(inter_file):
        reviewer = get_reviewer(
            data_fp, mode="simulate", model="nb", embedding_fp=embedding_fp,
            prior_included=[1, 3], prior_excluded=[2, 4], log_file=inter_file,
            n_instances=1, n_queries=1)
        reviewer.review()
    copyfile(inter_file, h5_log_file)
    check_model(monkeypatch, model="nb", log_file=h5_log_file,
                continue_from_log=True, n_instances=1, n_queries=2)


def test_lstm_base(monkeypatch):
    check_model(monkeypatch,
                config_file=os.path.join(cfg_dir, "lstm_base.ini"),
                log_file=h5_log_file)


def test_lstm_pool(monkeypatch):
    check_model(monkeypatch,
                config_file=os.path.join(cfg_dir, "lstm_pool.ini"),
                log_file=json_log_file)


def test_nb(monkeypatch):
    check_model(monkeypatch,
                model="nb",
                log_file=h5_log_file,
                use_granular=True,
                n_instances=1,
                n_queries=2)


def test_svm(monkeypatch):
    check_model(monkeypatch,
                model="svm",
                log_file=json_log_file,
                use_granular=False,
                n_instances=1,
                n_queries=2)


def check_label_methods(label_methods, n_labels, methods):
    assert len(label_methods) == n_labels
    for method in label_methods:
        assert method in methods


def check_log(logger):

    check_label_methods(logger.get("label_methods", 0), 4, ["initial"])
    check_label_methods(logger.get("label_methods", 1), 1, ["max", "random"])
    check_label_methods(logger.get("label_methods", 2), 1, ["max", "random"])

    assert len(logger.get("labelled", 0)) == 4
    assert len(logger.get("labelled", 1)) == 1
    assert len(logger.get("labelled", 2)) == 1

    assert len(logger.get("train_idx", 1)) == 4
    assert len(logger.get("pool_idx", 1)) == 2

    assert len(logger.get("train_idx", 2)) == 5
    assert len(logger.get("pool_idx", 2)) == 1

    assert len(logger.get("labels")) == 6


def check_model(monkeypatch=None, use_granular=False, log_file=h5_log_file,
                continue_from_log=False, mode="oracle", **kwargs):
    if not continue_from_log:
        try:
            os.unlink(log_file)
        except OSError:
            pass

    if monkeypatch is not None:
        monkeypatch.setattr('builtins.input', lambda _: "0")
    # start the review process.
    reviewer = get_reviewer(data_fp, mode=mode, embedding_fp=embedding_fp,
                            prior_included=[1, 3], prior_excluded=[2, 4],
                            log_file=log_file,
                            **kwargs)
    if use_granular:
        with Logger.from_file(log_file) as logger:
            # Two loops of training and classification.
            reviewer.train()
            reviewer.log_probabilities(logger)
            query_idx = reviewer.query(1)
            inclusions = reviewer._get_labels(query_idx)
            reviewer.classify(query_idx, inclusions, logger)

            reviewer.train()
            reviewer.log_probabilities(logger)
            query_idx = reviewer.query(1)
            inclusions = reviewer._get_labels(query_idx)
            reviewer.classify(query_idx, inclusions, logger)
    else:
        reviewer.review()

    with Logger.from_file(log_file, read_only=True) as logger:
        check_log(logger)
