from pathlib import Path
from tensorflow.python.keras.wrappers.scikit_learn import KerasClassifier

import asreview as asr
from asreview.models import create_lstm_pool_model
from asreview.models import create_lstm_base_model
from asreview.models.sklearn_models import create_nb_model, create_svc_model

data_fp = Path("test", "demo_data", "csv_example_with_labels.csv")
embedding_fp = Path("test", "demo_data", "csv_example_with_labels.vec")


def test_lstm_pool(monkeypatch):
    check_lstm(create_lstm_base_model, monkeypatch)


def test_lstm_base(monkeypatch):
    check_lstm(create_lstm_pool_model, monkeypatch)


def test_nb(monkeypatch):
    check_nb_svm(create_nb_model, monkeypatch)


def test_svm(monkeypatch):
    check_nb_svm(create_svc_model, monkeypatch)


def check_log(log_dict):
    assert len(log_dict["0"]["labelled"]) == 4
    assert len(log_dict["0"]["train_proba"]) == 4
    assert len(log_dict["0"]["pool_proba"]) == 2

    assert len(log_dict["1"]["labelled"]) == 1
    assert len(log_dict["1"]["train_proba"]) == 5
    assert len(log_dict["1"]["pool_proba"]) == 1

    assert len(log_dict["2"]["labelled"]) == 1

    assert "time" in log_dict
    assert "version" in log_dict
    assert "labels" in log_dict


def check_lstm(lstm_model, monkeypatch):
    # load data
    data, texts, _ = asr.read_data(data_fp)

    # create features and labels
    X, word_index = asr.text_to_features(texts)

    # Load embedding layer.
    embedding = asr.load_embedding(embedding_fp, word_index=word_index)
    embedding_matrix = asr.sample_embedding(embedding, word_index)

    # create the model
    model = KerasClassifier(
        lstm_model(embedding_matrix=embedding_matrix),
        verbose=1,
    )

    fit_kwargs = {"epochs": 2, "batch_size": 2, "class_weight": 20.0}

    monkeypatch.setattr('builtins.input', lambda _: "0")
    # start the review process.
    reviewer = asr.ReviewOracle(
        X,
        data=data,
        model=model,
        n_instances=1,
        n_queries=1,
        fit_kwargs=fit_kwargs,
        prior_included=[1, 3],  # List of some included papers
        prior_excluded=[2, 4],  # List of some excluded papers
    )
    reviewer.review()
    check_log(reviewer._logger._log_dict)


def check_nb_svm(sk_model, monkeypatch):
    # load data
    data, texts, _ = asr.read_data(data_fp)

    # create features and labels
    X, _ = asr.text_to_features(texts)

    # create the model
    model = sk_model()

    monkeypatch.setattr('builtins.input', lambda _: "0")

    # start the review process.
    reviewer = asr.ReviewOracle(
        X,
        data=data,
        model=model,
        n_instances=1,
        n_queries=1,
        prior_included=[1, 3],  # List of some included papers
        prior_excluded=[2, 4],  # List of some excluded papers
    )
    reviewer.review()
    check_log(reviewer._logger._log_dict)
