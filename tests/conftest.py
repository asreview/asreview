from pathlib import Path
import shutil
import urllib.request

import pandas as pd
import pytest

from asreview import Project


_OSF_CACHE_DIR = Path("~/.cache/asreview_tests").expanduser()
_OSF_FG93A_URL = "https://osf.io/download/fg93a/"


@pytest.fixture(scope="session")
def osf_fg93a_path():
    """Return a local path to the OSF fg93a dataset, downloading it if needed."""
    _OSF_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Return cached file without making any network requests
    cached_files = list(_OSF_CACHE_DIR.iterdir())
    if cached_files:
        return cached_files[0]

    # No cached file found, download it
    from asreview.utils import _get_filename_from_url

    filename = _get_filename_from_url(_OSF_FG93A_URL)
    cache_file = _OSF_CACHE_DIR / filename
    urllib.request.urlretrieve(_OSF_FG93A_URL, cache_file)
    return cache_file


@pytest.fixture
def demo_data(render_data=False):
    """Get a demo dataset.

    Returns
    -------
    pd.DataFrame:
        A demo dataset with 10 inclusions and 90 exclusions. Inclusions are found on
        every 10th row. The dataset is a sample from the van der Waal 2022 dataset.
    """

    if render_data:
        from synergy_dataset import Dataset

        df = Dataset("van_der_Waal_2022").to_frame(["title", "abstract", "open_access"])
        df_is_oa = df[df["open_access"].apply(lambda x: x["is_oa"])]

        df_inclusions = df_is_oa[df_is_oa["label_included"] == 1].sample(
            10, replace=False, random_state=165
        )

        df_is_oa = df_is_oa[df_is_oa["label_included"] == 0].sample(
            100, replace=False, random_state=165
        )
        df_is_oa.iloc[::-10] = df_inclusions

        df_is_oa.to_json(Path("tests", "demo_data.json"), orient="records", lines=True)
        # df_is_oa.to_csv(Path("tests", "demo_data.csv"), index=False)
        return df_is_oa

    return pd.read_json(Path("tests", "demo_data.json"), orient="records", lines=True)


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


@pytest.fixture
def asreview_test_project_path(tmpdir):
    """Fixture to set up a test project for ASReview."""
    test_state_fp = Path("tests", "asreview_files", "asreview-demo-project.asreview")
    tmp_project_path = Path(tmpdir, "asreview-demo-project.asreview")
    shutil.copy(test_state_fp, tmp_project_path)
    return tmp_project_path


@pytest.fixture
def asreview_test_project(asreview_test_project_path, tmpdir):
    unzip_path = Path(tmpdir, "unzipped_project")
    project = Project.load(asreview_test_project_path, unzip_path)
    # Access the database so that any pending schema fixups (e.g. new columns)
    # are applied before tests that may reopen the DB in read-only mode.
    project.db  # noqa: B018
    return project
