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


def test_passwords_are_random(test_app, test_database, add_user):
    """Test that the hash of passwords are actually random."""
    user_first = add_user("test1", "test@test.com", "greaterthaneight")
    user_second = add_user("test2", "test@test2.com", "greaterthaneight")
    assert user_first.password != user_second.password


def test_encode_token(test_app, test_database, add_user):
    """Test the encoding of the token in auth.models.User."""
    user = add_user("test", "test@test.com", "test")
    token = user.encode_token(user.id, "access")
    print(token)
    assert isinstance(token, str)


def test_decode_token(test_app, test_database, add_user):
    """Test the decoding of the token in auth.models.User."""
    user = add_user("test", "test@test.com", "test")
    token = user.encode_token(user.id, "access")
    assert isinstance(token, str)
    assert User.decode_token(token) == user.id
