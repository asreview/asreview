
from pathlib import Path

import asreview as asr
from asreview.readers import ASReviewData


def test_csv_reader_without_labels():

    fp = Path("test", "demo_data", "csv_example_without_labels.csv")
    data = asr.read_csv(fp)

    assert len(data) == 2

    assert 'label_included' not in data[0].keys()


def test_csv_reader_with_labels():

    fp = Path("test", "demo_data", "csv_example_with_labels.csv")
    data = asr.read_csv(fp)

    assert len(data) == 6

    for i in range(len(data)):
        assert data[i]['label_included'] == 1 - (i % 2)


def test_csv_load_data():

    fp = Path("test", "demo_data", "csv_example_with_labels.csv")
    _, x, y = asr.read_data(fp)

    assert x.shape[0] == 6
    assert y.shape[0] == 6

    fp = Path("test", "demo_data", "csv_example_without_labels.csv")
    _, x, y = asr.read_data(fp)

    assert x.shape[0] == 2 and y is None


def test_ris_reader_without_labels():

    fp = Path("test", "demo_data", "ris_example_without_labels.ris")
    data = asr.read_ris(fp)

    assert len(data) == 2

    assert 'label_included' not in data[0].keys()


def check_as_data(as_data):
    assert as_data.raw_df.shape[0] == 2
    cols = ['labels', 'title', 'abstract', 'keywords', 'article_id']
    print(as_data.labels)
    for col in cols:
        print(col)
        assert len(getattr(as_data, col)) == 2
    assert as_data.labels[0] == 1
    assert as_data.labels[1] == 0


def test_ris_reader_with_labels():

    fp = Path("test", "demo_data", "ris_example_with_labels.ris")
    test_fp = Path("test", "demo_data", "export_test.ris")
    as_data = asr.ASReviewData.from_file(fp)
    check_as_data(as_data)

    as_data.to_ris(test_fp)
    check_as_data(as_data)


def test_ris_load_data():

    fp = Path("test", "demo_data", "ris_example_with_labels.ris")
    _, x, y = asr.ASReviewData.from_file(fp).get_data()

    assert x.shape[0] == 2
    assert y.shape[0] == 2

    fp = Path("test", "demo_data", "ris_example_without_labels.ris")
    _, x, y = asr.ASReviewData.from_file(fp).get_data()

    assert x.shape[0] == 2 and y is None


def test_csv_write_data():
    fp_in = Path("test", "demo_data", "csv_example_with_labels.csv")
    fp_out = Path("test", "out_data", "csv_out_example.csv")
    asr_data = ASReviewData.from_file(fp_in)
    asr_data.to_csv(fp_out, labels=[0, 1, 0, 1, 0, 1])
