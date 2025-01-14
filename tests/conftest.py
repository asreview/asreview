import pytest
from pathlib import Path

from synergy_dataset import Dataset


@pytest.fixture
def demo_data():
    """Get a demo dataset.

    Returns
    -------
    pd.DataFrame:
        A demo dataset with 10 inclusions and 90 exclusions. Inclusions are found on
        every 10th row. The dataset is a sample from the van der Waal 2022 dataset.
    """

    df = Dataset("van_der_Waal_2022").to_frame()

    df_inclusions = df[df["label_included"] == 1].sample(
        10, replace=False, random_state=535
    )
    df = df[df["label_included"] == 0].sample(100, replace=False, random_state=535)
    df.iloc[::-10] = df_inclusions

    return df


@pytest.fixture
def demo_data_path(demo_data, tmp_path):
    """Get path to a demo dataset stored in a temporary file.

    Returns
    -------
    Path:
        Path to CSV file containing the demo dataset.
    """
    file_path = tmp_path / "demo_data.csv"
    demo_data.to_csv(file_path, index=False)
    return file_path


@pytest.fixture
def tmp_project(tmpdir):
    """Get a temporary project path.

    Returns
    -------
    Path:
        Path to a temporary project.
    """

    return Path(tmpdir, "test.asreview")
