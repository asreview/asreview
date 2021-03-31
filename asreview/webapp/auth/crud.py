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

from asreview.webapp.auth.models import User
from asreview.webapp.extensions import db


def get_all_users():
    """Retrieve all users.

    Returns
    --------
    list:
        A list of all users in the database.
    """
    return User.query.all()


def get_user_by_id(user_id):
    """Retrieve one user by id.

    Arguments
    ---------
    user_id: int
        The ID of the user to retrieve.

    Returns
    -------
    User:
        The user object of the first user found with id == user_id. 
    """
    return User.query.filter_by(id=user_id).first()


def get_user_by_email(email):
    """Retrieve one user by email.

    Arguments
    ---------
    email: str
        The email of the user to retrieve.

    Returns
    -------
    User:
        The user object of the first user found with email == email.
    """
    return User.query.filter_by(email=email).first()


def add_user(username, email, password):
    """Create one user.

    Arguments
    ---------
    username: str
        The username of the new user.
    email: str
        The email of the new user.
    password: str
        The password of the new user.

    Returns
    -------
    User:
        The user object of the newly created user.
    """
    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()
    return user


def update_user(user, username, email):
    """Update one user.

    Arguments
    ---------
    user: object
        The user object of the user to update.
    username: str
        The username of the user to update.
    email: str
        The email of the user to update.

    Returns
    -------
    User:
        The user object of the newly updated user.
    """
    user.username = username
    user.email = email
    db.session.commit()
    return user


def delete_user(user):
    """Delete one user.

    Arguments
    ---------
    user: object
        The user object of the user to delete.
    """
    db.session.delete(user)
    db.session.commit()
    return user
