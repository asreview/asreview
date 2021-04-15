# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json

from asreview.webapp.start_flask import bcrypt
from asreview.webapp.auth.crud import get_user_by_id
from asreview.webapp.auth.models import User


def test_add_user(test_app, test_database):
    """Test add a new user."""
    client = test_app.test_client()
    resp = client.post(
        "/user/create",
        data=json.dumps(
            {
                "username": "test",
                "email": "test@test.com",
                "password": "test",
            }
        ),
        content_type="application/json",
    )
    data = json.loads(resp.data.decode())
    assert resp.status_code == 201
    assert "test@test.com was added!" in data["message"]


def test_add_user_invalid_json(test_app, test_database):
    """Test invalid payload."""
    client = test_app.test_client()
    resp = client.post(
        "/user/create",
        data=json.dumps({}),
        content_type="application/json",
    )
    assert resp.status_code == 400


def test_add_user_invalid_json_keys(test_app, test_database):
    """Test partially add a user (missing username)."""
    client = test_app.test_client()
    resp = client.post(
        "/user/create",
        data=json.dumps(
            {"email": "test@test.com",
             "password": "test"}
        ),
        content_type="application/json",
    )
    assert resp.status_code == 400


def test_add_user_duplicate_email(test_app, test_database):
    """Add an already existing user."""
    client = test_app.test_client()
    client.post(
        "/user/create",
        data=json.dumps(
            {
                "username": "test",
                "email": "test@test.com",
                "password": "test",
            }
        ),
        content_type="application/json",
    )
    resp = client.post(
        "/user/create",
        data=json.dumps(
            {
                "username": "test",
                "email": "test@test.com",
                "password": "test",
            }
        ),
        content_type="application/json",
    )
    data = json.loads(resp.data.decode())
    assert resp.status_code == 400
    assert "Sorry. That email already exists." in data["message"]


def test_single_user(test_app, test_database, add_user):
    """Test retrieve a user."""
    user = add_user(
        "test",
        "test@test.com",
        "password")
    client = test_app.test_client()
    resp = client.get(f"/user/{user.id}")
    data = json.loads(resp.data.decode())
    assert resp.status_code == 200
    assert "test" in data["username"]
    assert "test@test.com" in data["email"]
    assert "password" not in data


# def test_single_user_incorrect_id(test_app, test_database):
#     """Test retrieve a user that does not exist."""
#     client = test_app.test_client()
#     resp = client.get("/user/999")
#     data = json.loads(resp.data.decode())
#     assert resp.status_code == 404
#     assert "User 999 does not exist" in data["message"]


# def test_remove_user(test_app, test_database, add_user):
#     """Test remove user."""
#     # Load the user
#     test_database.session.query(User).delete()
#     user = add_user("test", "test@test.com", "password")
#     client = test_app.test_client()
#     resp = client.get("/user/")
#     data = json.loads(resp.data.decode())
#     assert resp.status_code == 200
#     assert len(data) == 1

#     # Get the user and delete it
#     get_user = client.delete(f"/user/{user.id}")
#     data = json.loads(get_user.data.decode())
#     assert get_user.status_code == 200
#     assert "test@test.com was removed!" in data["message"]

#     # Search for the user, should not exist
#     search_user = client.get("/user/")
#     data = json.loads(search_user.data.decode())
#     assert search_user.status_code == 200
#     assert len(data) == 0


# def test_update_user(test_app, test_database, add_user):
#     """Update user."""
#     user = add_user("test", "test@test.com", "password")
#     client = test_app.test_client()
#     resp_one = client.put(
#         f"/user/{user.id}",
#         data=json.dumps({"username": "update", "email": "update@test.com"}),
#         content_type="application/json",
#     )
#     data = json.loads(resp_one.data.decode())
#     assert resp_one.status_code == 200
#     assert f"{user.id} was updated!" in data["message"]

#     resp_two = client.get(f"/user/{user.id}")
#     data = json.loads(resp_two.data.decode())
#     assert resp_two.status_code == 200
#     assert "update" in data["username"]
#     assert "update@test.com" in data["email"]
