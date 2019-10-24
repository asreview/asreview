import os
from shutil import copyfile

from asreview.review.factory import get_reviewer
from asreview.utils import get_logger_class

data_fp = os.path.join("test", "demo_data", "csv_example_with_labels.csv")
embedding_fp = os.path.join("test", "demo_data", "csv_example_with_labels.vec")
cfg_dir = os.path.join("test", "cfg_files")
log_dir = os.path.join("test", "log_files")
h5_log_file = os.path.join(log_dir, "test.h5")
json_log_file = os.path.join(log_dir, "test.json")
src_log_fp = os.path.join(log_dir, "start_from_1.json")


# To generate log file to start from, don't forget to set
# n_queries in the generated log file to 2.

# def test_lstm_base(monkeypatch):
#     check_lstm(monkeypatch,
#                config_file=os.path.join(cfg_dir, "lstm_pool_query_1.ini"),
#                log_file=os.path.join("test", "log_files", "test.json"))
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
                use_granular=True)


def test_svm(monkeypatch):
    check_model(monkeypatch,
                model="svm",
                log_file=json_log_file,
                use_granular=False)


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


def check_model(monkeypatch, use_granular=False, log_file=h5_log_file,
                continue_from_log=False, **kwargs):
    if not continue_from_log:
        try:
            os.unlink(log_file)
        except OSError:
            pass

    monkeypatch.setattr('builtins.input', lambda _: "0")
    # start the review process.
    reviewer = get_reviewer(data_fp, mode="oracle", embedding_fp=embedding_fp,
                            prior_included=[1, 3], prior_excluded=[2, 4],
                            log_file=log_file,
                            **kwargs)
    Logger = get_logger_class(log_file)
    if use_granular:
        with Logger(log_file) as logger:
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

    with Logger(log_file) as logger:
        check_log(logger)
