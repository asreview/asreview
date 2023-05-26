import time
from inspect import getfullargspec

import pytest

import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.data.base import _get_filename_from_url
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.tests.utils.config_parser import get_user

# NOTE: I don't see a plugin that can be used for testing
# purposes
UPLOAD_DATA = [
    {"benchmark": "benchmark:Hall_2012"},
    {"url": "https://raw.githubusercontent.com/asreview/" +
        "asreview/master/tests/demo_data/generic_labels.csv"}
]


# Test getting all projects
def test_get_projects(setup_no_auth):
    client, project = setup_no_auth
    status_code, data = au.get_all_projects(client)
    assert status_code == 200
    assert len(data["result"]) == 1
    found_project = data["result"][0]
    assert found_project["id"] == project.project_id
