# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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

def test_testing_config(test_app):
    test_app.config.from_object("asreview.webapp.config.TestingConfig")
    assert test_app.config["SECRET_KEY"] == "secret_key"
    assert test_app.config["TESTING"]
    assert not test_app.config["PRESERVE_CONTEXT_ON_EXCEPTION"]
    assert test_app.config["SQLALCHEMY_DATABASE_URI"] == "sqlite:///:memory:"
    assert test_app.config["BCRYPT_LOG_ROUNDS"] == 4
    assert test_app.config["ACCESS_TOKEN_EXPIRATION"] == 3
    assert test_app.config["REFRESH_TOKEN_EXPIRATION"] == 3


def test_development_config(test_app):
    test_app.config.from_object("asreview.webapp.config.DevelopmentConfig")
    assert test_app.config["SECRET_KEY"] == "secret_key"
    assert not test_app.config["TESTING"]
    assert test_app.config["SQLALCHEMY_DATABASE_URI"] == "sqlite:///:memory:"
    assert test_app.config["BCRYPT_LOG_ROUNDS"] == 4
    assert test_app.config["ACCESS_TOKEN_EXPIRATION"] == 900
    assert test_app.config["REFRESH_TOKEN_EXPIRATION"] == 2592000
