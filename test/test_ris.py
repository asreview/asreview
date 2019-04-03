
from pathlib import Path

import asr


def test_ris_reader_without_labels():

    fp = Path("test", "demo_data", "ris_example_without_labels.ris")
    data = asr.read_ris(fp)

    assert len(data) == 2

    assert 'label_included' not in data[0].keys()


def test_ris_reader_with_labels():

    fp = Path("test", "demo_data", "ris_example_with_labels.ris")
    data = asr.read_ris(fp, labels=True)

    assert len(data) == 2

    assert data[0]['label_included'] == '1'
    assert data[1]['label_included'] == '0'
