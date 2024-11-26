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

class RemoteUserHandler:

    default_headers = {
        'USER_IDENTIFIER_HEADER': 'REMOTE_USER',
        'USER_NAME_HEADER': 'REMOTE_USER_NAME',
        'USER_EMAIL_HEADER': 'REMOTE_USER_EMAIL',
        'USER_AFFILIATION_HEADER': 'REMOTE_USER_AFFILIATION',
        'DEFAULT_EMAIL_DOMAIN': 'localhost',
        'DEFAULT_AFFILIATION': '',
    }

    def __init__(self, config={}):
        for key, value in self.__class__.default_headers.items():
            self.__dict__[key.lower()] = config.get(key, value)

    def handle_request(self, request):
        """Check the request headers and extract the configured headers,
        falling back to the use of default values."""
        identifier = request.get(self.user_identifier_header, '')
        identifier_parts = identifier.split("@")
        username = identifier_parts[0] # if identifier is not an email address, this will be the whole identifier

        default_email = identifier if len(identifier_parts) > 1 else f"{username}@{self.default_email_domain}"

        return {
            'identifier': identifier if identifier else None,
            'name': request.get(self.user_name_header, username),
            'email': request.get(self.user_email_header, default_email),
            'affiliation': request.get(self.user_affiliation_header, self.default_affiliation),
        }
