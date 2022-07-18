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

from pathlib import Path

from flask_login import UserMixin
from sqlalchemy import Column, ForeignKey, Integer, String
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
    projects = relationship(
        'Project',
        back_populates='owner',
        cascade='all'
    )

    def __init__(self, username=None, password=None):
        self.username = username
        self.hashed_password = generate_password_hash(password)

    def verify_password(self, password):
        """Verify password"""
        return check_password_hash(self.hashed_password, password)

    def __repr__(self):
        return f'<User {self.username!r}, id: {self.id}>'

@DB.event.listens_for(User, 'before_delete')
def receive_before_delete(_mapper, connection, target):
    """Deleting a user also means deleting his/her registered
    projects. This is done 'manually' since cascading doesn't
    work without configuration in SQLite. An additional argument
    is that we probably want to avoid deleting users in a
    collaboration context."""
    @DB.event.listens_for(Session, 'after_flush', once=True)
    def receive_after_flush(session, context):
        for project in target.projects:
            session.delete(project)


class UnauthenticatedUser:
    """This class serves an unauthenticated app, we use a pseudo user
    to bypass authentication."""
    def __init__(self):
        self.id = None
        self.is_authenticated = False
        self.is_active = False
        self.is_anonymous = True

    def get_id(self):
        """This class needs to have this method implemented
        for the LoginManager"""
        return 'unauthenticated'

    def __repr__(self):
        return f'<UnauthenticatedUser>'


class Project(DB.Model):
    """Project table"""
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True)
    project_id = Column(String(250), nullable=False, unique=True)
    folder = Column(String(100), nullable=False, unique=True)
    owner_id = Column(
        Integer,
        ForeignKey(User.id), #, ondelete='CASCADE'),
        nullable=False
    )
    owner = relationship(
        'User',
        back_populates='projects'
    )

    @property
    def project_path(self):
        """Returns full project path"""
        return Path(utils.asreview_path(), self.folder)

    def __repr__(self):
        return f'<Project id: {self.project_id}, owner_id: {self.owner_id}>'
