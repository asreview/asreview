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

from werkzeug.exceptions import HTTPException


class RemoteUserNotAllowed(HTTPException):
    code = 401
    description = "Attempted to authenticate a remote user, but the REMOTE_AUTH_SECRET did not match."


class RemoteUserHandler:
    default_headers = {
        "USER_IDENTIFIER_HEADER": "REMOTE_USER",
        "USER_NAME_HEADER": False,
        "USER_EMAIL_HEADER": False,
        "USER_AFFILIATION_HEADER": False,
        "DEFAULT_EMAIL_DOMAIN": "localhost",
        "DEFAULT_AFFILIATION": None,
    }

    def __init__(self, config={}):
        for key, value in self.__class__.default_headers.items():
            self.__dict__[key.lower()] = config.get(key, value)

        self.remote_auth_secret = config.get("REMOTE_AUTH_SECRET", None)

    def handle_request(self, env_headers):
        """Check the request"s environment headers and extract the configured headers,
        falling back to the use of default values."""

        if self.remote_auth_secret and not (
            self.remote_auth_secret == env_headers.get("REMOTE_AUTH_SECRET", False)
        ):
            raise RemoteUserNotAllowed

        identifier = env_headers.get(self.user_identifier_header, "")
        identifier_parts = identifier.split("@")
        username = identifier_parts[
            0
        ]  # if identifier is not an email address, this will be the whole identifier

        email = env_headers.get(self.user_email_header, False)
        # if email was not explicitly set:
        # check if identifier contained an "@", and use it as email address
        # else create email using the username and default email domain
        if not email and len(identifier_parts) > 1:
            email = identifier
        elif not email:
            email = f"{username}@{self.default_email_domain}"

        return {
            "identifier": identifier if identifier else None,
            "name": env_headers.get(self.user_name_header, username),
            "email": email,
            "affiliation": env_headers.get(
                self.user_affiliation_header, self.default_affiliation
            ),
        }
