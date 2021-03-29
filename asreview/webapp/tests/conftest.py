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

import pytest

from asreview.webapp.start_flask import create_app
from asreview.webapp.start_flask import db
from asreview.webapp.auth.models import User


@pytest.fixture(scope="module")
def app():
    app = create_app()
    return app


@pytest.fixture(scope="module")
def test_client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture(scope="module")
def test_app(app):
    """A test client for the app."""
    app.config.from_object("asreview.webapp.config.TestingConfig")
    with app.app_context():
        yield app  # testing happens here


@pytest.fixture(scope="module")
def test_database():
    """Database for the app."""
    db.create_all()
    yield db  # testing happens here
    db.session.remove()
    db.drop_all()


@pytest.fixture(scope="module")
def add_user():
    """Add user to database."""
    def _add_user(username, email, password):
        user = User(username=username, email=email, password=password)
        db.session.add(user)
        db.session.commit()
        return user

    return _add_user
