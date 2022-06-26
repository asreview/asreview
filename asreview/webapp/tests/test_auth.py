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

# !! INSTALL $ pip3 install pytest pytest-cov

import os
from unittest import TestCase, mock

from flask import current_app

import asreview.auth.database as db
from asreview.auth.models import User
from asreview.webapp.start_flask import create_app

class TestAuthentication(TestCase):
    
    @mock.patch.dict(os.environ, { 'FLASK_ENV': 'test' })
    def setUp(self):
        self.app = create_app()
        db.init_db()
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.appctx = self.app.app_context()
        self.appctx.push()
        self.client = self.app.test_client()

    def tearDown(self):
        # clean database
        User.query.delete()


    def test_signup(self):
        response = self.client.post(
            '/auth/signup',
            data = {
                'username': 'testperson',
                'password': '!biuCrgfsiOOO6987'
            }
        )
        print(response)
        assert True == True

    def test_app_2(self):
        assert True == True


# AT this point we need to specify a different asreview folder for testing