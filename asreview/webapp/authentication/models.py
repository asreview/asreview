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
from uuid import uuid4

from flask_login import UserMixin
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, 
    String
)
from sqlalchemy.orm import relationship, validates
from sqlalchemy.orm.session import Session
from werkzeug.security import check_password_hash, generate_password_hash

import asreview.utils as utils
from asreview.webapp import DB


class User(UserMixin, DB.Model):
    """The User model for user accounts."""
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    identifier = Column(String(100), nullable=False)
    origin = Column(String(100), nullable=False)
    email = Column(String(100), unique=True)
    name = Column(String(100))
    affiliation = Column(String(100))
    hashed_password = Column(String(100), unique=True)
    verified = Column(Boolean)
    public = Column(Boolean)
    token = Column(String(50))
    token_created_at = Column(DateTime)

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

    @validates('identifier')
    def validate_identifier(self, _key, identifier):
        if not bool(identifier):
            raise ValueError('Identifier is required')
        return identifier

    @validates('origin')
    def validate_origin(self, _key, origin):
        if not bool(origin):
            raise ValueError('Origin is required')
        return origin

    @validates('name')
    def validate_origin(self, _key, name):
        if not bool(name):
            raise ValueError('Name is required')
        return name

    # this is pretty weird, it 'loops', starting at 
    # origin, stores origin because of the return, moves
    # on to email and now self contains origin so
    # I can compare it... and so on.
    @validates('origin', 'email', 'hashed_password')
    def validate_password(self, key, value):
        if key == 'email' and self.origin == 'system' and \
            bool(value) == False:
            raise ValueError('Email is required when origin is "system"')
        if key == 'hashed_password' and self.origin == 'system' and \
            bool(value) == False:
            raise ValueError('Password is required when origin is "system"')                
        return value

    def __init__(
            self,
            identifier,
            origin='system',
            email=None,
            name=None,
            affiliation=None,
            password=None,
            verified=False,
            public=True,
        ):

        self.identifier = identifier
        self.origin = origin
        self.email = email
        self.name = name
        self.affiliation = affiliation
        if bool(password):
            self.hashed_password = generate_password_hash(password)
        self.verified = verified
        self.public = public


    def update_profile(
        self,
        email,
        name,
        affiliation,
        password=None,
        public=True):

        self.email = email
        self.name = name
        self.affiliation = affiliation
        if self.origin == 'system' and bool(password):
            self.hashed_password = generate_password_hash(password)
        self.public = public

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
            'id': self.id,
            'name': self.get_name(),
            'email': self.email
        }

    def generate_token(self):
        """Generate a token for verification by email"""
        return str(uuid4())

    def __repr__(self):
        return f'<User {self.email!r}, id: {self.id}>'


class SingleUser:
    """This class serves an unauthenticated app, we use a pseudo user
    to bypass authentication."""
    def __init__(self):
        self.id = None
        self.email = None
        self.is_authenticated = True
        self.is_active = False
        self.is_anonymous = True

    def is_authenticated(self):
      return True

    def is_active(self):
      return True

    def is_anonymous(self):
      return False

    def get_id(self):
        """This class needs to have this method implemented
        for the LoginManager"""
        return 0

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

