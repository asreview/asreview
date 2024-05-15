from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from pandas.testing import assert_frame_equal

import asreview as asr


@pytest.mark.xfail(raises=ValueError, reason="Bad record_id")
def test_bad_record_id():
    data_fp = Path("tests", "demo_data", "generic_bad_record_id.csv")
    as_data = asr.load_dataset(data_fp)
    assert len(np.unique(as_data.df.index.values)) == len(as_data)


def test_record_id():
    data_fp = Path("tests", "demo_data", "record_id.csv")
    as_data = asr.load_dataset(data_fp)

    # test is labels are numpy array
    assert isinstance(as_data.labels, np.ndarray)

    # test is index name is record_id
    assert as_data.df.index.name == "record_id"


def test_column_names_with_spaces():
    data_fp = Path("tests", "demo_data", "generic.csv")
    as_data = asr.load_dataset(data_fp)

    data_fp_bad_cols = Path(
        "tests", "demo_data", "generic_column_names_with_spaces.csv"
    )
    as_data_bad_cols = asr.load_dataset(data_fp_bad_cols)

    assert_frame_equal(
        as_data.df[["title", "abstract"]], as_data_bad_cols.df[["title", "abstract"]]
    )


def test_asdata_init():
    data_fp = Path("tests", "demo_data", "generic.csv")

    # data via pandas
    df = pd.read_csv(data_fp)
    df.index.name = "record_id"
    as_data_init = asr.Dataset(df)

    # data via classmethod
    as_data = asr.load_dataset(data_fp)

    assert_frame_equal(as_data_init.df, as_data.df)
