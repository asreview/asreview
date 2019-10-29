import os

import asreview as asr
from asreview.models.sklearn_models import create_nb_model, create_svc_model
from asreview.review.factory import get_reviewer

data_fp = os.path.join("test", "demo_data", "csv_example_with_labels.csv")
embedding_fp = os.path.join("test", "demo_data", "csv_example_with_labels.vec")
cfg_dir = os.path.join("test", "cfg_files")
src_log_fp = os.path.join("test", "log_files", "start_from_1.json")


# To generate log file to start from, don't forget to set
# n_queries in the generated log file to 2.

# def test_lstm_base(monkeypatch):
#     check_lstm(monkeypatch,
#                config_file=os.path.join(cfg_dir, "lstm_pool_query_1.ini"),
#                log_file=os.path.join("test", "log_files", "test.json"))


def test_lstm_base(monkeypatch):
    check_lstm(monkeypatch, config_file=os.path.join(cfg_dir, "lstm_base.ini"))


def test_lstm_pool(monkeypatch):
    check_lstm(monkeypatch,
               config_file=os.path.join(cfg_dir, "lstm_pool.ini"))


def test_lstm_pool_from_log(monkeypatch):
    check_lstm(monkeypatch, src_log_fp=src_log_fp,
               config_file=os.path.join(cfg_dir, "lstm_pool.ini"))


def test_lstm_pool_granular(monkeypatch):
    check_lstm(monkeypatch, use_granular=True,
               config_file=os.path.join(cfg_dir, "lstm_pool.ini"))


def test_nb(monkeypatch):
    check_nb_svm(create_nb_model, monkeypatch)


def test_svm(monkeypatch):
    check_nb_svm(create_svc_model, monkeypatch)


def check_label_methods(label_methods, n_labeled, methods):
    n_cur_label = 0
    for method in label_methods:
        assert method[0] in methods
        assert isinstance(method[1], int)
        n_cur_label += method[1]
    assert n_cur_label == n_labeled


def check_log(log_dict):
    results = log_dict["results"]

    for i, res in enumerate(results):
        print(i, ":", res)
    check_label_methods(results[0]["label_methods"], 4, ["initial"])
    check_label_methods(results[1]["label_methods"], 1, ["max", "random"])
    check_label_methods(results[2]["label_methods"], 1, ["max", "random"])

    assert len(results[0]["labelled"]) == 4
    assert len(results[1]["labelled"]) == 1
    assert len(results[2]["labelled"]) == 1

    assert len(results[1]["train_proba"]) == 4
    assert len(results[1]["pool_proba"]) == 2

    assert len(results[2]["train_proba"]) == 5
    assert len(results[2]["pool_proba"]) == 1

    assert "time" in log_dict
    assert "version" in log_dict
    assert "labels" in log_dict and len(log_dict["labels"]) == 6


def check_lstm(monkeypatch, use_granular=False, **kwargs):
    monkeypatch.setattr('builtins.input', lambda _: "0")
    # start the review process.
    reviewer = get_reviewer(data_fp, mode="oracle", embedding_fp=embedding_fp,
                            prior_included=[1, 3], prior_excluded=[2, 4],
                            **kwargs)
    if use_granular:
        # Two loops of training and classification.
        reviewer.train()
        reviewer.log_probabilities()
        query_idx = reviewer.query(1)
        inclusions = reviewer._get_labels(query_idx)
        reviewer.classify(query_idx, inclusions)

        reviewer.train()
        reviewer.log_probabilities()
        query_idx = reviewer.query(1)
        inclusions = reviewer._get_labels(query_idx)
        reviewer.classify(query_idx, inclusions)
    else:
        reviewer.review()
    check_log(reviewer._logger._log_dict)


def check_nb_svm(sk_model, monkeypatch):
    # load data
    as_data = asr.ASReviewData.from_file(data_fp)
    _, texts, _ = as_data.get_data()

    # create features and labels
    X, _ = asr.text_to_features(texts)

    # create the model
    model = sk_model()

    monkeypatch.setattr('builtins.input', lambda _: "0")

    # start the review process.
    reviewer = asr.ReviewOracle(
        X,
        as_data=as_data,
        model=model,
        n_instances=1,
        n_queries=2,
        prior_included=[1, 3],  # List of some included papers
        prior_excluded=[2, 4],  # List of some excluded papers
    )
    reviewer.review()
    check_log(reviewer._logger._log_dict)
