import pytest
from jinja2.exceptions import TemplateNotFound
from asreview.webapp.authentication.models import User
from asreview.webapp.tests.utils.misc import custom_remote_auth_headers

# ###################
# NO LOGIN WHEN HEADER NOT SET
# ###################


@pytest.mark.parametrize("uri", ["/", "/signup"])
def test_no_login_without_header(client_remote_auth, uri):
    r = client_remote_auth.get(uri)
    assert r.status_code == 302
    assert r.location == "/signin"


# ###################
# LOGIN WHEN HEADER SET
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
    assert user == None

    with pytest.raises(TemplateNotFound) as e:
        r = get_uri(uri)

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
