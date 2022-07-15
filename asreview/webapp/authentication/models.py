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

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from asreview.webapp import DB


class User(UserMixin, DB.Model):
    __tablename__ = 'users'
    id = DB.Column(DB.Integer, primary_key=True)
    username = DB.Column(DB.String(50), unique=True)
    hashed_password = DB.Column(DB.String(100), unique=True)

    def __init__(self, username=None, password=None):
        self.username = username
        self.hashed_password = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def __repr__(self):
        return f'<User {self.username!r}, id: {self.id}>'


class UnauthenticatedUser:

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
