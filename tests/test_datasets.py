from pytest import mark

from asreview.datasets import BaseDataGroup
from asreview.datasets import BaseDataSet
from asreview.datasets import DatasetManager
from asreview.datasets import NaturePublicationDataGroup


@mark.parametrize("data_id", [
    "benchmark:van_de_Schoot_2017",
    "benchmark:Hall_2012",
    "benchmark:Cohen_2006_ACEInhibitors",
    "benchmark:Bos_2018",
])
def test_datasets(data_id):
    data = DatasetManager().find(data_id)
    assert data.filepath.startswith("https://raw.githubusercontent.com/asreview/")
    assert data.title is not None


def test_group():

    group_nature = NaturePublicationDataGroup()

    assert group_nature.group_id is not None

    assert len(group_nature.datasets) == 4

    for d in group_nature.datasets:
        assert d.filepath. \
            startswith("https://raw.githubusercontent.com/asreview/paper-asreview")


def test_group_to_dict():

    group_nature = NaturePublicationDataGroup()

    assert isinstance(group_nature.__dict__(), dict)


def test_group_list():

    dm = DatasetManager()

    nature_group = dm.list(include="benchmark-nature", raise_on_error=True, serialize=False)[0]

    assert len(nature_group.datasets) == 4

    for d in nature_group.datasets:
        assert d.filepath. \
            startswith("https://raw.githubusercontent.com/asreview/paper-asreview")


def test_template_group():

    # START - use for building your plugin
    my_dataset1 = BaseDataSet(
        dataset_id="my_dataset1",
        filepath="http",
        title="My dataset"
    )

    my_dataset2 = BaseDataSet(
        dataset_id="my_dataset2",
        filepath="http",
        title="My second dataset",
        aliases=["J535"]
    )

    class TemplateDataGroup(BaseDataGroup):
        group_id = "template"
        description = "Template group"

        def __init__(self):

            super(TemplateDataGroup, self).__init__(
                my_dataset1, my_dataset2
            )
    # END

    my_group = TemplateDataGroup()

    my_group.find("my_dataset1").title == "My dataset"
    my_group.find("j535").title == "My second dataset"  # see lowercase alias
