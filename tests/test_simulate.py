import pytest
from pathlib import Path

from asreview.entry_points.simulate import SimulateEntryPoint


@pytest.mark.xfail(raises=FileNotFoundError,
                   reason="File, URL, or dataset does not exist: "
                          "'simulate_test/this_doesnt_exist.csv'")
def test_dataset_not_found(tmpdir):
    entry_point = SimulateEntryPoint()
    project_fp = Path(tmpdir, 'project.asreview')
    argv = f'does_not.exist -s {project_fp}'.split()
    entry_point.execute(argv)