from pathlib import Path

import asr


def test_log_reader():

    log_fp = Path("test", "demo_data", "logs", "results0.log")

    log = asr.read_log(str(log_fp))

    assert isinstance(log, asr.Logger)


def test_batch_log_reader():

    log_folder = Path("test", "demo_data", "logs")

    log_list = asr.read_logs_from_dir(str(log_folder))

    assert len(log_list) == 2

    assert all(map(lambda x: isinstance(x, asr.Logger), log_list))


def test_batch_log_reader_prefix():

    log_folder = Path("test", "demo_data", "logs")

    log_list = asr.read_logs_from_dir(
        str(log_folder),
        prefix="results"
    )

    assert len(log_list) == 1

    assert all(map(lambda x: isinstance(x, asr.Logger), log_list))
