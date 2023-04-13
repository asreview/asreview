import json
from pathlib import Path
from shutil import copyfile
from shutil import make_archive
from zipfile import ZipFile

from asreview.project import ASReviewProject
from asreview.project import open_state
from asreview.state.legacy.json import JSONState
from asreview.state.legacy.utils import open_state as open_state_legacy
from asreview.state.legacy.utils import state_from_file
from asreview.state.sql_converter import is_converted_project
from asreview.state.sql_converter import rollback_conversion
from asreview.state.sql_converter import upgrade_asreview_project_file

OLD_STATE_FP = Path("tests", "asreview_files", "test_converter_example_old.asreview")


def compare_state_to_converted(state_fp, converted_state_fp):
    """Compare an old state file to a converted state file and
    check that the contents are the same

    Arguments
    ---------
    state_fp: path-like
        Filepath to the old project file.
    converted_state_fp: path-like
        Filepath to the converted state file.
    """
    with open(Path(state_fp.parent, "labeled.json"), "r") as file:
        labeled_json = json.load(file)
    # old_record_ids = [x[0] for x in labeled_json]
    old_labels = [x[1] for x in labeled_json]

    with open_state_legacy(state_fp) as old_state:
        old_state_length = len(old_state._state_dict["labels"])

        data_hash = list(old_state._state_dict["data_properties"].keys())[0]
        old_feature_matrix = old_state.get_feature_matrix(data_hash)
        old_settings = old_state.settings.to_dict()

    with open_state(converted_state_fp) as new_state:
        # Get data from the new state.
        new_record_ids = new_state.get_order_of_labeling().tolist()
        new_labels = new_state.get_labels().tolist()
        new_settings = new_state.settings.to_dict()

    new_project = ASReviewProject(converted_state_fp)
    feature_extraction_method = new_project.feature_matrices[0]["id"]
    new_feature_matrix = new_project.get_feature_matrix(feature_extraction_method)

    # Compare data.
    # assert old_indices == new_record_ids
    assert max(new_record_ids) < old_state_length
    assert old_labels == new_labels
    # assert old_query_strategies == new_query_strategies
    assert (old_feature_matrix != new_feature_matrix).nnz == 0
    assert old_settings == new_settings


def test_converter(tmpdir):
    # Copy old project file to temporary folder.
    converted_fp = Path(tmpdir, "converted.asreview")
    copyfile(OLD_STATE_FP, converted_fp)

    # Unzip the converted state file.
    unzipped_fp = Path(tmpdir, "unzipped.asreview")
    with ZipFile(converted_fp) as zipobj:
        zipobj.extractall(unzipped_fp)
    converted_fp = unzipped_fp
    # -------------------------------------------------
    # Convert the old project file to a new state file.
    upgrade_asreview_project_file(converted_fp, from_version=0, to_version=1)

    # Check that the contents are the same.
    compare_state_to_converted(
        Path(converted_fp, "legacy", "result.json"), converted_fp
    )

    # Check if the rollback works.
    assert is_converted_project(converted_fp)
    rollback_conversion(converted_fp)

    # Zip the converted file to allow for reading it.
    zipped_fp = make_archive(Path(tmpdir, "zipped"), "zip", converted_fp)
    zipped_fp = Path(zipped_fp).rename(Path(tmpdir, "zipped.asreview"))

    state = state_from_file(zipped_fp)[zipped_fp.name]
    assert isinstance(state, JSONState)
