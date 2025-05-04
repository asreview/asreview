# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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
import random
import re
from pathlib import Path

from flask_login import UserMixin
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.orm import validates
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from asreview.webapp import DB
from asreview.webapp.utils import asreview_path

PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"  # noqa
EMAIL_REGEX = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"
VALID_ROLES = {"member", "admin"}


class User(UserMixin, DB.Model):
    """The User model for user accounts."""

    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    identifier = Column(String(100), nullable=False, unique=True)
    origin = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True, unique=True)
    name = Column(String(100))
    affiliation = Column(String(100))
    hashed_password = Column(String(500))
    confirmed = Column(Boolean)
    public = Column(Boolean)
    token = Column(String(150))
    token_created_at = Column(DateTime)
    role = Column(String(10), default="member")

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
            raise ValueError("Name must contain more than 2 characters")
        return name

    @validates("email")
    def validate_email(self, key, email):
        if key == "email" and self.origin == "asreview":
            if bool(email) is False:
                raise ValueError("Email is required when origin is 'asreview'")
            elif not User.valid_email(email):
                raise ValueError(f"Email address '{email}' is not valid")
        return email

    @validates("role")
    def validate_role(self, _key, role):
        if role not in VALID_ROLES:
            raise ValueError(f"Invalid role: {role}")
        return role

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
        if self.origin == "asreview":
            self.hashed_password = User.create_password_hash(password)
        self.confirmed = confirmed
        self.public = public

    def update_profile(
        self,
        email,
        name,
        affiliation,
        old_password=None,
        new_password=None,
        public=True,
    ):
        # if there is a request to update the password, and the origin
        # is correct
        if self.origin == "asreview":
            if bool(old_password) and bool(new_password):
                # verify the old password
                if not self.verify_password(old_password):
                    raise ValueError("Provided old password is incorrect.")
                else:
                    # old password is verified. The following line will raise
                    # a ValueError if the new password is wrong
                    self.hashed_password = User.create_password_hash(new_password)

            # email has been changed
            if self.email != email:
                self.set_token()
                self.confirmed = False

        self.email = email
        self.name = name
        self.affiliation = affiliation
        self.public = public

        return self

    def reset_password(self, new_password):
        if self.origin == "asreview":
            self.hashed_password = User.create_password_hash(new_password)
        # reset token
        self.token = None
        self.token_created_at = None
        return self

    def set_token(self):
        """Set token data (used in email verification after
        init, and for forgot-password"""
        token_number = random.randint(0, 999999)

        self.token = f"{token_number:06d}"
        self.token_created_at = dt.datetime.now()
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
        return {
            "id": self.id,
            "name": self.get_name(),
            "affiliation": self.affiliation,
            "email": self.email,
        }

    def confirm_user(self):
        """This function confirms a user by setting the confirmed
        field to True and removes the token data"""
        self.confirmed = True
        self.token = None
        self.token_created_at = None
        return self

    def token_valid(self, provided_token, max_minutes=20):
        """Checks whether provided token is correct and still valid"""
        # there must be a token and a timestamp
        if bool(self.token) and bool(self.token_created_at):
            diff = (dt.datetime.now() - self.token_created_at).total_seconds()
            # return if token is correct and we are still before deadline
            return self.token == provided_token and diff <= max_minutes * 60
        else:
            return False

    @property
    def is_admin(self):
        return self.role == "admin"

    @property
    def is_member(self):
        return self.role == "member"

    @classmethod
    def valid_password(cls, password):
        return re.fullmatch(PASSWORD_REGEX, password)

    @classmethod
    def valid_email(cls, email):
        return re.fullmatch(EMAIL_REGEX, email)

    @classmethod
    def create_password_hash(cls, password):
        if bool(password) and User.valid_password(password):
            return generate_password_hash(password)
        else:
            raise ValueError(f'Password "{password}" does not meet requirements.')

    def __repr__(self):
        return f"<User {self.email!r}, id: {self.id}>"


class Collaboration(DB.Model):
    __tablename__ = "collaborations"
    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="cascade"), nullable=False
    )
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="cascade"), nullable=False
    )
    # make sure we have unique records in this table
    __table_args__ = (
        UniqueConstraint("project_id", "user_id", name="unique_records_collaboration"),
    )

    def __repr__(self):
        return f"<Collaboration project:{self.project_id} user:{self.user_id}>"


class Project(DB.Model):
    """Project table"""

    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    project_id = Column(String(250), nullable=False, unique=True)
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
        return Path(asreview_path(), self.project_id)

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
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="cascade"), nullable=False
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="cascade"), nullable=False
    )
    # make sure we have unique records in this table
    __table_args__ = (
        UniqueConstraint("project_id", "user_id", name="unique_records_invitations"),
    )

    def __repr__(self):
        pid = self.project_id
        uid = self.user_id
        return f"<CollaborationInvitation project:{pid} user:{uid}>"


def create_database_and_tables(engine):
    """Creating database and tables with engine"""
    DB.Model.metadata.create_all(engine)
