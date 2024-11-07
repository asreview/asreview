import pytest
from pytest import mark

from asreview.datasets import BaseDataGroup
from asreview.datasets import BaseDataSet
from asreview.datasets import DatasetManager
from asreview.datasets import SynergyDataGroup


@mark.internet_required
def test_group():
    group_synergy = SynergyDataGroup()

    assert group_synergy.group_id is not None

    assert len(group_synergy.datasets) == 26


@mark.internet_required
def test_group_to_dict():
    group_synergy = SynergyDataGroup()

    assert isinstance(group_synergy.__dict__(), dict)


@mark.internet_required
def test_group_list():
    dm = DatasetManager()

    synergy_group = dm.list(include="synergy", raise_on_error=True, serialize=False)[0]

    assert len(synergy_group.datasets) == 26


def test_group_exclude_list():
    dm = DatasetManager()

    groups = dm.list(exclude="synergy", raise_on_error=True, serialize=False)
    assert "synergy" not in [group.group_id for group in groups]

    groups = dm.list(exclude=["synergy"], raise_on_error=True, serialize=False)
    assert "synergy" not in [group.group_id for group in groups]


def test_template_group():
    # START - use for building your plugin
    my_dataset1 = BaseDataSet(
        dataset_id="my_dataset1", filepath="http", title="My dataset"
    )

    my_dataset2 = BaseDataSet(
        dataset_id="my_dataset2",
        filepath="http",
        title="My second dataset",
        aliases=["J535"],
    )

    class TemplateDataGroup(BaseDataGroup):
        group_id = "template"
        description = "Template group"

        def __init__(self):
            super().__init__(my_dataset1, my_dataset2)

    # END

    my_group = TemplateDataGroup()

    assert my_group.find("my_dataset1").title == "My dataset"
    assert my_group.find("j535").title == "My second dataset"  # see lowercase alias


@pytest.mark.xfail(raises=TypeError)
def test_template_group_abc():
    my_dataset1 = BaseDataSet(
        dataset_id="my_dataset2",
        filepath="http",
        title="My second dataset",
        aliases=["J535"],
    )

    class TemplateDataGroup(BaseDataGroup):
        description = "Template group"

    TemplateDataGroup(my_dataset1)
