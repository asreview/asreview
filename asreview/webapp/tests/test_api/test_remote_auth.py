import pytest
from jinja2.exceptions import TemplateNotFound

from asreview.webapp._authentication.models import User
from asreview.webapp.tests.utils.misc import custom_remote_auth_headers

# ###################
# LOGIN FAILS
# ###################


@pytest.mark.parametrize("uri", ["/", "/signup"])
def test_no_login_without_header(client_remote_auth, uri):
    custom_headers = custom_remote_auth_headers(
        identifier=""
    )  # setup the REMOTE_AUTH_SECRET header
    r = client_remote_auth.get(uri, **custom_headers)
    assert r.status_code == 302
    assert r.location == "/signin"


def test_no_login_without_secret(client_remote_auth, uri="/"):
    custom_headers = custom_remote_auth_headers(identifier="foo", secret=None)

    response = client_remote_auth.get(uri, follow_redirects=True, **custom_headers)
    assert "REMOTE_AUTH_SECRET did not match" in response.get_json()["message"]
    assert response.status_code == 401


# ###################
# LOGIN SUCCESSFUL
# ###################


@pytest.mark.parametrize("uri", ["/", "/signup"])
def test_login_with_header(client_remote_auth, uri):
    user_identifier = "foo"
    custom_headers = custom_remote_auth_headers(identifier=user_identifier)

    def get_uri(path):
        return client_remote_auth.get(uri, follow_redirects=True, **custom_headers)

    def find_user(identifier):
        return User.query.filter(User.identifier == identifier).one_or_none()

    user = find_user(user_identifier)
    assert user is None

    try:
        get_uri(uri)
    except TemplateNotFound:
        pass

    user = find_user(user_identifier)
    assert user
    assert user.is_authenticated
    assert user.email == "foo@dev.bar"
    assert user.affiliation == "UU"


# ###################
# API
# ###################


def test_api_returns_401_without_header(client_remote_auth):
    r = client_remote_auth.get("/auth/user")
    assert r.status_code == 401


def test_api_returns_user_with_header(client_remote_auth):
    custom_headers = custom_remote_auth_headers(identifier="foo@dev.bar")

    r = client_remote_auth.get("/auth/user", **custom_headers)
    user_info = r.get_json()
    assert user_info["id"] == 1
    assert user_info["name"] == "foo"
