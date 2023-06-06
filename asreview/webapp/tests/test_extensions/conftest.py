import pytest

from asreview.webapp import DB
from asreview.webapp.tests.utils import crud

@pytest.fixture()
def setup_teardown(client_auth):
    yield client_auth
    crud.delete_everything(DB)

    
    

