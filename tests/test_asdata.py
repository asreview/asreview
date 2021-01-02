from pathlib import Path

import numpy as np
import pytest

from asreview import ASReviewData


@pytest.mark.xfail(raises=ValueError, reason="Bad record_id")
def test_bad_record_id():
    data_fp = Path("tests", "demo_data", "generic_bad_record_id.csv")
    as_data = ASReviewData.from_file(data_fp)
    assert(len(np.unique(as_data.df.index.values)) == len(as_data))


def test_record_id():
    data_fp = Path("tests", "demo_data", "record_id.csv")
    as_data = ASReviewData.from_file(data_fp)

    # test is labels are numpy array
    assert isinstance(as_data.labels, np.ndarray)

    # test is index name is record_id
    assert as_data.df.index.name == "record_id"
