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

from email.headerregistry import UniqueAddressHeader
from pathlib import Path

from flask_login import UserMixin
from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, String, Table, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.orm.session import Session
from werkzeug.security import check_password_hash, generate_password_hash

import asreview.utils as utils
from asreview.webapp import DB


class User(UserMixin, DB.Model):
    """The User model for user accounts."""
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    hashed_password = Column(String(100), unique=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    affiliation = Column(String(100))
    email = Column(String(100))
    public = Column(Boolean)

    projects = relationship(
        'Project',
        back_populates='owner',
        cascade='all, delete'
    )
    involved_in = relationship(
        'Project',
        secondary='collaborations',
        back_populates='collaborators'
    )
    pending_invitations = relationship(
        'Project',
        secondary='collaboration_invitations',
        back_populates='pending_invitations'
    )

    def __init__(self, username, password, first_name=None,
        last_name=None, affiliation=None, email=None, public=True):
        self.username = username
        self.first_name = first_name
        self.last_name = last_name
        self.affiliation = affiliation
        self.email = email
        self.public = public
        self.hashed_password = generate_password_hash(password)

    def verify_password(self, password):
        """Verify password"""
        return check_password_hash(self.hashed_password, password)

    def __repr__(self):
        return f'<User {self.username!r}, id: {self.id}>'


class SingleUser:
    """This class serves an unauthenticated app, we use a pseudo user
    to bypass authentication."""
    def __init__(self):
        self.id = None
        self.username = None
        self.is_authenticated = True
        self.is_active = False
        self.is_anonymous = True

    def get_id(self):
        """This class needs to have this method implemented
        for the LoginManager"""
        return 'single_user'

    def __repr__(self):
        return f'<SingleUser>'


class Collaboration(DB.Model):
    __tablename__ = 'collaborations'
    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='cascade')
    )
    project_id = Column(
        Integer,
        ForeignKey('projects.id', ondelete='cascade')
    )


class Project(DB.Model):
    """Project table"""
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True)
    project_id = Column(String(250), nullable=False, unique=True)
    folder = Column(String(100), nullable=False, unique=True)
    owner_id = Column(
        Integer,
        ForeignKey(User.id),
        nullable=False
    )
    owner = relationship(
        'User',
        back_populates='projects'
    )
    # do not delete cascade: we don't want to 
    # lose users, only collaborations
    collaborators = relationship(
        'User',
        secondary='collaborations',
        back_populates='involved_in'
    )
    pending_invitations = relationship(
        'User',
        secondary='collaboration_invitations',
        back_populates='pending_invitations'
    )

    @property
    def project_path(self):
        """Returns full project path"""
        return Path(utils.asreview_path(), self.folder)

    def __repr__(self):
        return f'<Project id: {self.project_id}, owner_id: {self.owner_id}>'


class CollaborationInvitation(DB.Model):
    """Colleboration invitations"""
    __tablename__ = 'collaboration_invitations'
    id = Column(Integer, primary_key=True)
    project_id = Column(
        Integer,
        ForeignKey('projects.id', ondelete='cascade')
    )
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='cascade')
    )

