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

from functools import wraps

from flask import current_app
from flask import jsonify
from flask import request
from flask_login import current_user
from flask_login.config import EXEMPT_METHODS


def asreview_login_required(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not current_app.config.get("AUTHENTICATION_ENABLED"):
            pass
        elif request.method in EXEMPT_METHODS:
            pass
        else:
            if not (bool(current_user) and current_user.is_authenticated):
                return jsonify({"message": "login required"}), 401

        return func(*args, **kwargs)

    return decorated_view
