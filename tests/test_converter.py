from shutil import copyfile
from zipfile import ZipFile
from pathlib import Path

from asreview.state.sql_converter import upgrade_asreview_project_file
from asreview.state.legacy.utils import open_state as open_state_legacy
from asreview.state.utils import open_state

OLD_STATE_FP = Path('tests', 'state_files', 'old-project.asreview')


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
    with open_state_legacy(state_fp) as old_state:
        # Get data from the old state.
        old_indices = []
        old_labels = []
        old_query_strategies = []
        for query in range(old_state.n_queries()):
            old_indices += old_state.get('label_idx', query_i=query).tolist()
            old_labels += old_state.get('inclusions', query_i=query).tolist()
            old_query_strategies += old_state.get('label_methods',
                                                  query_i=query).tolist()

        # Get the record ids corresponding to the indices.
        data_hash = list(old_state._state_dict['data_properties'].keys())[0]
        old_record_table = old_state._state_dict['data_properties'][data_hash][
            'record_table']
        old_record_ids = [old_record_table[i] for i in old_indices]

        old_feature_matrix = old_state.get_feature_matrix(data_hash)
        old_settings = old_state.settings.to_dict()

    with open_state(converted_state_fp) as new_state:
        # Get data from the new state.
        new_record_ids = new_state.get_order_of_labeling().tolist()
        new_labels = new_state.get_labels().tolist()
        new_query_strategies = new_state.get_query_strategies().tolist()

        new_feature_matrix = new_state.get_feature_matrix()
        new_settings = new_state.settings.to_dict()

    # Compare data.
    assert old_record_ids == new_record_ids
    assert old_labels == new_labels
    assert old_query_strategies == new_query_strategies
    assert (old_feature_matrix != new_feature_matrix).nnz == 0
    assert old_settings == new_settings


def test_converter(tmpdir):
    # Copy old project file to temporary folder.
    converted_fp = Path(tmpdir, 'converted.asreview')
    copyfile(OLD_STATE_FP, converted_fp)

    # Unzip the converted state file.
    unzipped_fp = Path(tmpdir, 'unzipped.asreview')
    with ZipFile(converted_fp) as zipobj:
        zipobj.extractall(unzipped_fp)
    converted_fp = unzipped_fp
    # -------------------------------------------------
    # Convert the old project file to a new state file.
    upgrade_asreview_project_file(converted_fp, from_version=0, to_version=1)

    # Check that the contents are the same.
    compare_state_to_converted(converted_fp / 'result.json', converted_fp)
