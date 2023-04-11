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
from flask import session
from flask_login.config import EXEMPT_METHODS
from flask_login.utils import _get_user


def asreview_login_required(func):
    """
    Adjusted version of login_required of flask-login
    =================================================

    If you decorate a view with this, it will ensure that the current user is
    logged in and authenticated before calling the actual view. (If they are
    not, it calls the :attr:`LoginManager.unauthorized` callback.) For
    example::

        @app.route('/post')
        @asreview_login_required
        def post():
            pass

    If there are only certain times you need to require that your user is
    logged in, you can do so with::

        if not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()

    ...which is essentially the code that this function adds to your views.

    It can be convenient to globally turn off authentication when unit testing.
    To enable this, if the application configuration variable
    `AUTHENTICATION_ENABLED` is set to `False`, this decorator will be ignored.

    .. Note ::

        Per `W3 guidelines for CORS preflight requests
        <http://www.w3.org/TR/cors/#cross-origin-request-with-preflight-0>`_,
        HTTP ``OPTIONS`` requests are exempt from login checks.

    :param func: The view function to decorate.
    :type func: function
    """
    @wraps(func)
    def decorated_view(*args, **kwargs):

        print(session)
        print(session.get("_user_id"))

        if request.method in EXEMPT_METHODS:
            pass
        elif not current_app.config.get("AUTHENTICATION_ENABLED"):
            pass
        else:
            # get current user
            print(_get_user())
            current_user = _get_user()

            if not (bool(current_user) and current_user.is_authenticated):
                return jsonify({"message": "login required"}), 401

        # # TODO@Jonathan/Casper
        # # flask 1.x compatibility <= WE REQUIRE FLASK >= 2.0 but
        # # this function was used by Flask. Don't understand.
        # # current_app.ensure_sync is only available in Flask >= 2.0
        # if callable(getattr(current_app, "ensure_sync", None)):
        #     return current_app.ensure_sync(func)(*args, **kwargs)

        return func(*args, **kwargs)

    return decorated_view
