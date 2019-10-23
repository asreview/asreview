import os

from test.test_oracle import check_model


data_fp = os.path.join("test", "demo_data", "csv_example_with_labels.csv")
embedding_fp = os.path.join("test", "demo_data", "csv_example_with_labels.vec")
cfg_dir = os.path.join("test", "cfg_files")
log_dir = os.path.join("test", "log_files")
h5_log_file = os.path.join(log_dir, "test.h5")
json_log_file = os.path.join(log_dir, "test.json")


def test_lstm_base():
    check_model(mode="simulate",
                config_file=os.path.join(cfg_dir, "lstm_base.ini"),
                log_file=h5_log_file)


def test_lstm_pool():
    check_model(mode="simulate",
                config_file=os.path.join(cfg_dir, "lstm_pool.ini"),
                log_file=json_log_file)


def test_nb():
    check_model(mode="simulate",
                model="nb",
                log_file=h5_log_file,
                use_granular=True)


def test_svm():
    check_model(mode="simulate",
                model="svm",
                log_file=json_log_file,
                use_granular=False,
                n_instances=1, n_queries=2)
