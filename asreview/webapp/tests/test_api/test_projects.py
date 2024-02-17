import inspect
import json
import time
from pathlib import Path
from typing import Union

import pytest
from flask import current_app
from flask.testing import FlaskClient
from jsonschema.exceptions import ValidationError

import asreview as asr
import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import Project

# NOTE: I don't see a plugin that can be used for testing
# purposes
UPLOAD_DATA = [
    {"benchmark": "synergy:van_der_Valk_2021"},
    {
        "url": "https://raw.githubusercontent.com/asreview/"
        + "asreview/master/tests/demo_data/generic_labels.csv"
    },
]


def _asreview_file_archive():
    return list(
        Path("asreview", "webapp", "tests", "asreview-project-file-archive").glob(
            "*/asreview-project-*-startreview.asreview"
        )
    )


# NOTE: the setup fixture entails: a FlaskClient, 1 user (signed in),
# and a project of this user OR a project from an unauthenticated app.
# The fixture is parametrized! It runs the authenticated app and the
# unauthenticated app.


# Test getting all projects
def test_get_projects(setup):
    client, user1, project = setup
    r = au.get_all_projects(client)
    assert r.status_code == 200
    assert len(r.json["result"]) == 1
    found_project = r.json["result"][0]
    if not current_app.config.get("LOGIN_DISABLED"):
        assert found_project["id"] == project.project_id
        assert found_project["owner_id"] == user1.id
    else:
        assert found_project["id"] == project.config["id"]


# Test create a project
def test_create_projects(setup):
    client, _, _ = setup

    r = au.create_project(client)
    assert r.status_code == 201
    assert r.json["name"].startswith("explore")


# Test create a project with incorrect tags
def test_create_projects_with_incorrect_tags(setup):
    client, _, project = setup
    tags = json.dumps([{"foo": "bar"}, {"foo1": "bar1"}])

    with pytest.raises(
        ValidationError, match=r".*Failed validating .*type.* in schema.*"
    ):
        # request
        au.update_project(
            client,
            project,
            tags=json.dumps(tags),
        )


# Test create a project with correct tags
def test_create_projects_with_correct_tags(setup):
    client, _, project = setup
    tags = [
        {
            "name": "Biomes",
            "id": "biomes",
            "values": [
                {"id": "boreal_forest", "name": "Boreal Forest"},
                {"id": "savanna", "name": "Savanna"},
                {"id": "mangrove", "name": "Mangrove"},
                {"id": "tropical_forest", "name": "Tropical Forest"},
            ],
        },
        {
            "name": "Restoration Approaches",
            "id": "restoration_approaches",
            "values": [
                {
                    "id": "direct_seeding",
                    "name": "Direct seeding (i.e. spreading/planting seeds)",
                },
                {
                    "id": "tree_planting",
                    "name": "Planting trees (i.e. planting trees as seedlings)",
                },
                {
                    "id": "assisted_natural_regeneration",
                    "name": "Assisted natural regeneration",
                },
                {
                    "id": "farmer_managed_natural_regeneration",
                    "name": "Farmer managed natural regeneration",
                },
            ],
        },
    ]

    # request
    r = au.update_project(
        client,
        project,
        tags=json.dumps(tags),
    )
    assert r.status_code == 200
    assert r.json["mode"] == "explore"
    assert r.json["tags"] == tags


# Test upgrading a post v0.x project
def test_try_upgrade_a_modern_project(setup):
    client, _, project = setup
    # verify version
    data = misc.read_project_file(project)
    assert not data["version"].startswith("0")

    r = au.upgrade_project(client, project)
    assert r.status_code == 200


# Test upgrading a v0.x project
def test_upgrade_an_old_project(setup):
    client, user, _ = setup

    tests_folder = Path(__file__).parent.parent
    asreview_v0_file = Path(
        tests_folder,
        "asreview-project-file-archive",
        "v0.19",
        "asreview-project-v0-19-startreview.asreview",
    )

    project = asr.Project.load(
        open(asreview_v0_file, "rb"), asreview_path(), safe_import=True
    )

    # we need to make sure this new, old-style project can be found
    # under current user if the app is authenticated
    if not current_app.config.get("LOGIN_DISABLED"):
        new_project = Project(project_id=project.config.get("id"))
        project = crud.create_project(DB, user, new_project)
    # try to convert
    r = au.upgrade_project(client, project)
    assert r.status_code == 400
    assert r.json["message"].startswith("Not possible to upgrade")


# Test importing old projects, verify ids
@pytest.mark.parametrize("fp", _asreview_file_archive())
def test_import_project_files(setup, fp):
    client, user, first_project = setup
    # import project
    r = au.import_project(client, fp)
    # get contents asreview folder
    folders = set(misc.get_folders_in_asreview_path())
    assert len(folders) == 2
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    if not current_app.config.get("LOGIN_DISABLED"):
        # assert it exists in the database
        assert crud.count_projects() == 2
        project = crud.last_project()
        assert r.json["id"] != first_project.project_id
        assert r.json["id"] == project.project_id
        # assert the owner is current user
        assert r.json["owner_id"] == user.id
    else:
        assert r.json["id"] != first_project.config.get("id")
    # in auth/non-auth the project folder must exist in the asreview folder
    assert r.json["id"] in set([f.stem for f in folders])


# Test get stats in setup state
def test_get_projects_stats_setup_stage(setup):
    client, _, _ = setup
    r = au.get_project_stats(client)
    assert r.status_code == 200
    assert isinstance(r.json["result"], dict)
    assert r.json["result"]["n_in_review"] == 0
    assert r.json["result"]["n_finished"] == 0
    assert r.json["result"]["n_setup"] == 1


# Test get stats in review state
def test_get_projects_stats_review_stage(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get stats
    r = au.get_project_stats(client)
    assert r.status_code == 200
    assert isinstance(r.json["result"], dict)
    assert r.json["result"]["n_in_review"] == 1
    assert r.json["result"]["n_finished"] == 0
    assert r.json["result"]["n_setup"] == 0


# Test get stats in finished state
def test_get_projects_stats_finished_stage(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # manually finish the project
    au.set_project_status(client, project, "finished")
    # get stats
    r = au.get_project_stats(client)
    assert r.status_code == 200
    assert isinstance(r.json["result"], dict)
    assert r.json["result"]["n_in_review"] == 0
    assert r.json["result"]["n_finished"] == 1
    assert r.json["result"]["n_setup"] == 0


# Test known demo data
@pytest.mark.parametrize("subset", ["plugin", "benchmark"])
def test_demo_data_project(setup, subset):
    client, _, _ = setup
    r = au.get_demo_data(client, subset)
    assert r.status_code == 200
    assert isinstance(r.json["result"], list)


# Test unknown demo data
def test_unknown_demo_data_project(setup):
    client, _, _ = setup
    r = au.get_demo_data(client, "abcdefg")
    assert r.status_code == 400
    assert r.json["message"] == "demo-data-loading-failed"


# Test uploading benchmark data to a project
@pytest.mark.parametrize("upload_data", UPLOAD_DATA)
def test_upload_benchmark_data_to_project(setup, upload_data):
    client, _, project = setup
    r = au.upload_data_to_project(client, project, data=upload_data)
    assert r.status_code == 200
    if not current_app.config.get("LOGIN_DISABLED"):
        assert r.json["project_id"] == project.project_id
    else:
        assert r.json["project_id"] == project.config.get("id")

    pickle_path = project.project_path / "tmp" / "data.pickle"
    assert not pickle_path.exists()
    asr.Project(project.project_path).read_data()
    assert pickle_path.exists()


# Test getting the data after an upload
@pytest.mark.parametrize("upload_data", UPLOAD_DATA)
def test_get_project_data(setup, upload_data):
    client, _, project = setup
    au.upload_data_to_project(client, project, data=upload_data)
    r = au.get_project_data(client, project)
    assert r.status_code == 200
    assert r.json["filename"] == misc.extract_filename_stem(upload_data)


# Test get dataset writer
def test_get_dataset_writer(setup):
    client, _, project = setup
    # upload data
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get dataset writer
    r = au.get_project_dataset_writer(client, project)
    assert r.status_code == 200
    assert isinstance(r.json["result"], list)


# Test updating a project
def test_update_project_info(setup):
    client, _, project = setup
    # update data
    new_name = "new name"
    new_authors = "new authors"
    new_description = "new description"
    new_tags = json.dumps(
        [
            {
                "name": "Biomes",
                "id": "biomes",
                "values": [
                    {"id": "boreal_forest", "name": "Boreal Forest"},
                    {"id": "savanna", "name": "Savanna"},
                    {"id": "mangrove", "name": "Mangrove"},
                    {"id": "tropical_forest", "name": "Tropical Forest"},
                ],
            },
            {
                "name": "Restoration Approaches",
                "id": "restoration_approaches",
                "values": [
                    {
                        "id": "direct_seeding",
                        "name": "Direct seeding (i.e. spreading/planting seeds)",
                    },
                    {
                        "id": "tree_planting",
                        "name": "Planting trees (i.e. planting trees as seedlings)",
                    },
                    {
                        "id": "assisted_natural_regeneration",
                        "name": "Assisted natural regeneration",
                    },
                    {
                        "id": "farmer_managed_natural_regeneration",
                        "name": "Farmer managed natural regeneration",
                    },
                ],
            },
        ]
    )

    # request
    r = au.update_project(
        client,
        project,
        name=new_name,
        # mode=new_mode,  # from version 2 on, it's no longer possible to update mode
        authors=new_authors,
        description=new_description,
        tags=new_tags,
    )
    assert r.status_code == 200
    assert r.json["authors"] == new_authors
    assert r.json["description"] == new_description
    assert r.json["mode"] == "explore"
    assert r.json["name"] == new_name
    assert r.json["tags"] == json.loads(new_tags)


# Test search data
def test_search_data(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # search
    r = au.search_project_data(client, project, query="Software&n_max=10")
    assert r.status_code == 200
    assert "result" in r.json
    assert isinstance(r.json["result"], list)
    assert len(r.json["result"]) <= 10


# Test get a selection of random papers to find exclusions
def test_random_prior_papers(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get random selection
    r = au.get_prior_random_project_data(client, project)
    assert r.status_code == 200
    assert "result" in r.json
    assert isinstance(r.json["result"], list)
    assert len(r.json["result"]) > 0


# Test labeling of prior data
@pytest.mark.parametrize("label", [0, 1])
def test_label_item(setup, label):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label
    r = au.label_random_project_data_record(client, project, label)
    assert r.status_code == 200
    assert r.json["success"]


# Test getting labeled records
def test_get_labeled_project_data(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label a random record
    au.label_random_project_data_record(client, project, 1)
    # collect labeled records
    r = au.get_labeled_project_data(client, project)
    assert r.status_code == 200
    assert "result" in r.json
    assert isinstance(r.json["result"], list)
    assert len(r.json["result"]) == 1


# Test getting labeled records stats
def test_get_labeled_stats(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # collect stats
    r = au.get_labeled_project_data_stats(client, project)

    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert r.json["n"] == 2
    assert r.json["n_exclusions"] == 1
    assert r.json["n_inclusions"] == 1
    assert r.json["n_prior"] == 2


# Test listing the available algorithms
def test_list_algorithms(setup):
    client, _, _ = setup
    r = au.get_project_algorithms_options(client)
    assert r.status_code == 200
    expected_keys = [
        "balance_strategy",
        "classifier",
        "feature_extraction",
        "query_strategy",
    ]
    for key in expected_keys:
        assert key in r.json.keys()
        assert isinstance(r.json[key], list)
        for item in r.json[key]:
            assert "name" in item.keys()
            assert "label" in item.keys()


# Test setting the algorithms
def test_set_project_algorithms(setup):
    client, _, project = setup
    data = misc.choose_project_algorithms()
    r = au.set_project_algorithms(client, project, data=data)
    assert r.status_code == 200
    assert r.json["success"]


# Test getting the project algorithms
def test_get_project_algorithms(setup):
    client, _, project = setup
    data_algorithms = misc.choose_project_algorithms()
    au.set_project_algorithms(client, project, data=data_algorithms)
    # get the project algorithms
    r = au.get_project_algorithms(client, project)
    assert r.status_code == 200
    assert r.json["balance_strategy"] == r.json["balance_strategy"]
    assert r.json["feature_extraction"] == r.json["feature_extraction"]
    assert r.json["model"] == r.json["model"]
    assert r.json["query_strategy"] == r.json["query_strategy"]


# Test starting the model
def test_start_and_model_ready(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # select a model
    data = misc.choose_project_algorithms()
    au.set_project_algorithms(client, project, data=data)
    # start the model
    r = au.start_project_algorithms(client, project)
    assert r.status_code == 200
    assert r.json["success"]
    # make sure model is done
    time.sleep(10)


# Test status of project
@pytest.mark.parametrize(
    ("state_name", "expected_state"),
    [
        ("creation", None),
        ("setup", "setup"),
        ("review", "review"),
        ("finish", "finished"),
    ],
)
def test_status_project(setup, state_name, expected_state):
    client, _, project = setup
    # call these progression steps
    if state_name in ["setup", "review", "finish"]:
        # upload dataset
        au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
        # label 2 records
        au.label_random_project_data_record(client, project, 1)
        au.label_random_project_data_record(client, project, 0)
        # select a model
        data = misc.choose_project_algorithms()
        au.set_project_algorithms(client, project, data=data)
    if state_name in ["review", "finish"]:
        # start the model
        au.start_project_algorithms(client, project)
        time.sleep(15)
    if state_name == "finish":
        # mark project as finished
        au.set_project_status(client, project, "finished")

    r = au.get_project_status(client, project)
    assert r.status_code == 200
    assert r.json["status"] == expected_state


# Test exporting the results
@pytest.mark.parametrize("format", ["csv", "tsv", "xlsx"])
def test_export_result(setup, format):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # request
    r = au.export_project_dataset(client, project, format)
    assert r.status_code == 200


# Test exporting the entire project
def test_export_project(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # request
    response = au.export_project(client, project)

    # get the file names in the project
    tree = misc.get_zip_file_names(response.data)

    # get the file names
    assert response.status_code == 200
    assert "project.json" in tree
    assert "tmp/data.pickle" not in tree


# Test setting the project status
@pytest.mark.parametrize("status", ["review", "finished"])
def test_set_project_status(setup, status):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # when setting the status to "review", the project must have another
    # status then "review"
    if status == "review":
        au.set_project_status(client, project, "finished")
    # set project status
    r = au.set_project_status(client, project, status)
    assert r.status_code == 200
    assert r.json["success"]


# Test get progress info
def test_get_progress_info(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # get progress
    r = au.get_project_progress(client, project)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert r.json["n_excluded"] == 1
    assert r.json["n_included"] == 1
    assert r.json["n_pool"] == r.json["n_papers"] - 2


# Test get progress density on the article
def test_get_progress_density(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # request progress density
    r = au.get_project_progress_density(client, project)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert isinstance(r.json["relevant"], list)
    assert isinstance(r.json["irrelevant"], list)


# Test progress recall
def test_get_progress_recall(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get recall
    r = au.get_project_progress_recall(client, project)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert isinstance(r.json["asreview"], list)
    assert isinstance(r.json["random"], list)


# Test retrieve documents in order to review
def test_retrieve_document_for_review(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get a document
    r = au.get_project_current_document(client, project)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert not r.json["pool_empty"]
    assert isinstance(r.json["result"], dict)
    assert isinstance(r.json["result"]["record_id"], int)


# Test label a document after the model has been started
def test_label_a_document_with_running_model(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get a document
    r = au.get_project_current_document(client, project)
    # get id
    record_id = r.json["result"]["record_id"]
    # label it
    r = au.label_project_record(
        client, project, record_id, label=1, prior=0, note="note"
    )
    assert r.status_code == 200
    assert r.json["success"]
    time.sleep(10)


# Test update label of a document after the model has been started
def test_update_label_of_document_with_running_model(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get a document
    r = au.get_project_current_document(client, project)
    # get id
    record_id = r.json["result"]["record_id"]
    # label it
    au.label_project_record(client, project, record_id, label=1, prior=0, note="note")
    # change label
    r = au.update_label_project_record(
        client, project, record_id, label=0, prior=0, note="changed note"
    )
    assert r.status_code == 200
    assert r.json["success"]
    time.sleep(10)


# Test deleting a project
def test_delete_project(setup):
    client, _, project = setup
    # delete project
    r = au.delete_project(client, project)
    assert r.status_code == 200
    assert r.json["success"]


@pytest.mark.parametrize(
    "api_call",
    [
        au.get_all_projects,
        au.create_project,
        au.create_project_from_dict,
        au.update_project,
        au.upgrade_project,
        au.get_project_stats,
        au.get_demo_data,
        au.upload_data_to_project,
        au.get_project_data,
        au.get_project_dataset_writer,
        au.search_project_data,
        au.get_prior_random_project_data,
        au.label_project_record,
        au.update_label_project_record,
        au.get_labeled_project_data,
        au.get_labeled_project_data_stats,
        au.get_project_algorithms_options,
        au.set_project_algorithms,
        au.get_project_algorithms,
        au.start_project_algorithms,
        au.get_project_status,
        au.set_project_status,
        au.export_project_dataset,
        au.export_project,
        au.get_project_progress,
        au.get_project_progress_density,
        au.get_project_progress_recall,
        au.get_project_current_document,
        au.delete_project,
    ],
)
def test_unauthorized_use_of_api_calls(setup, api_call):
    client, user, project = setup
    if not current_app.config.get("LOGIN_DISABLED"):
        # signout the client
        au.signout_user(client)
        # inspect function
        sig = inspect.signature(api_call)
        # form parameters
        parms = []
        for par in sig.parameters.keys():
            annotation = sig.parameters[par].annotation
            if annotation == FlaskClient:
                parms.append(client)
            elif annotation == Union[Project, asr.Project]:
                parms.append(project)
            elif annotation == int:
                parms.append(1)
            elif annotation == str:
                parms.append("abc")
            elif annotation == dict:
                parms.append({})

        # make the api call
        r = api_call(*parms)
        assert r.status_code == 401
    else:
        # no asserts in an unauthenticated app
        pass
