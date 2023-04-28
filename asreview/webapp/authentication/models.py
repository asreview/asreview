# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

import datetime as dt
import re
from pathlib import Path

from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import relationship
from sqlalchemy.orm import validates
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

import asreview.utils as utils
from asreview.webapp import DB

PASSWORD_REGEX = r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$" # noqa
EMAIL_REGEX = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"


class User(UserMixin, DB.Model):
    """The User model for user accounts."""

    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    identifier = Column(String(100), nullable=False)
    origin = Column(String(100), nullable=False)
    email = Column(String(100), unique=True)
    name = Column(String(100))
    affiliation = Column(String(100))
    hashed_password = Column(String(100), unique=True)
    confirmed = Column(Boolean)
    public = Column(Boolean)
    token = Column(String(50))
    token_created_at = Column(DateTime)

    projects = relationship("Project", back_populates="owner", cascade="all, delete")

    involved_in = relationship(
        "Project", secondary="collaborations", back_populates="collaborators"
    )

    pending_invitations = relationship(
        "Project",
        secondary="collaboration_invitations",
        back_populates="pending_invitations",
    )

    @validates("identifier")
    def validate_identifier(self, _key, identifier):
        if not bool(identifier):
            raise ValueError("Identifier is required")
        return identifier

    @validates("origin")
    def validate_origin(self, _key, origin):
        if not bool(origin):
            raise ValueError("Origin is required")
        return origin

    @validates("name")
    def validate_name(self, _key, name):
        if not bool(name):
            raise ValueError("Name is required")
        elif len(name) < 3:
            raise ValueError("Name must contain more than 2 characyers")
        return name

    @validates("email", "hashed_password")
    def validate_password(self, key, value):
        if key == "email" and self.origin == "asreview":
            if bool(value) is False:
                raise ValueError("Email is required when origin is 'asreview'")
            elif not User.valid_email(value):
                raise ValueError(f"Email address '{value}' is not valid")

        if (
            key == "hashed_password"
            and self.origin == "asreview"
            and bool(value) is False
        ):
            raise ValueError('Password is required when origin is "asreview"')
        return value

    def __init__(
        self,
        identifier,
        origin="asreview",
        email=None,
        name=None,
        affiliation=None,
        password=None,
        confirmed=False,
        public=True,
    ):
        self.identifier = identifier
        self.origin = origin
        self.email = email
        self.name = name
        self.affiliation = affiliation
        if self.origin == "asreview" and bool(password):
            self.hashed_password = User.create_password_hash(password)
        self.confirmed = confirmed
        self.public = public

    def update_profile(self, email, name, affiliation, password=None, public=True):
        self.email = email
        self.name = name
        self.affiliation = affiliation
        if self.origin == "asreview" and bool(password):
            self.hashed_password = User.create_password_hash(password)
        self.public = public

        return self

    def reset_password(self, new_password):
        if self.origin == "asreview" and bool(new_password):
            self.hashed_password = User.create_password_hash(new_password)
        # reset token
        self.token = None
        self.token_created_at = None
        return self

    def set_token_data(self, secret, salt):
        """Set token data (used in email verification after
        init, and for forgot-password"""
        token, token_created_at = User.generate_token_data(secret, salt, self.email)
        self.token = token
        self.token_created_at = token_created_at
        return self

    def verify_password(self, password):
        """Verify password"""
        if bool(self.hashed_password):
            return check_password_hash(self.hashed_password, password)
        else:
            return False

    def get_name(self):
        """Get name-ish thing from user account"""
        name = self.name or self.email
        return name

    def summarize(self):
        """Summarize user account in frontend data packet"""
        return {"id": self.id, "name": self.get_name(), "email": self.email}

    def confirm_user(self):
        """This function confirms a user by setting the confirmed
        field to True and removes the token data"""
        self.confirmed = True
        self.token = None
        self.token_created_at = None
        return self

    def token_valid(self, provided_token, max_hours=24):
        """Checks whether provided token is correct and still valid"""
        # there must be a token and a timestamp
        if bool(self.token) and bool(self.token_created_at):
            # what is now
            now = dt.datetime.utcnow()
            # get time-difference in hours
            diff = now - self.token_created_at
            # give me hours and remaining seconds
            [hours, r_secs] = divmod(diff.total_seconds(), 3600)
            # return if token is correct and we are still before deadline
            return self.token == provided_token and (
                hours <= max_hours or (hours == max_hours and r_secs < 60)
            )
        else:
            return False

    @classmethod
    def generate_token_data(cls, secret, salt, email):
        """Generate a token for verification by email"""
        serializer = URLSafeTimedSerializer(secret)
        token = serializer.dumps(email, salt=salt)
        created_at = dt.datetime.utcnow()
        return token, created_at

    @classmethod
    def valid_password(cls, password):
        return re.fullmatch(
            PASSWORD_REGEX, password
        )

    @classmethod
    def valid_email(cls, email):
        return re.fullmatch(
            EMAIL_REGEX, email
        )

    @classmethod
    def create_password_hash(cls, password):
        if bool(password) and User.valid_password(password):
            return generate_password_hash(password)
        else:
            raise ValueError(f'Password "{password}" does not meet requirements')

    def __repr__(self):
        return f"<User {self.email!r}, id: {self.id}>"


class Collaboration(DB.Model):
    __tablename__ = "collaborations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="cascade"))
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="cascade"))


class Project(DB.Model):
    """Project table"""

    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    project_id = Column(String(250), nullable=False, unique=True)
    folder = Column(String(100), nullable=False, unique=True)
    owner_id = Column(Integer, ForeignKey(User.id), nullable=False)
    owner = relationship("User", back_populates="projects")
    # do not delete cascade: we don't want to
    # lose users, only collaborations
    collaborators = relationship(
        "User", secondary="collaborations", back_populates="involved_in"
    )
    pending_invitations = relationship(
        "User",
        secondary="collaboration_invitations",
        back_populates="pending_invitations",
    )

    @property
    def project_path(self):
        """Returns full project path"""
        return Path(utils.asreview_path(), self.project_id)

    @property
    def folder(self):
        """Returns foldername (which is the project_id)"""
        return self.project_id

    def __repr__(self):
        return f"<Project id: {self.project_id}, owner_id: {self.owner_id}>"


class CollaborationInvitation(DB.Model):
    """Colleboration invitations"""

    __tablename__ = "collaboration_invitations"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="cascade"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="cascade"))
