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

import requests


class OAuthHandler:
    def __init__(self, configs=None):
        if not (bool(configs) and isinstance(configs, dict)):
            raise ValueError("OAuthHandler needs a configuration dictionary.")

        # check if all necessary config parameters are there
        services = {}
        for provider, config in configs.items():
            # get required parameters
            authorization_url = config.get("AUTHORIZATION_URL", False)
            token_url = config.get("TOKEN_URL", False)
            client_id = config.get("CLIENT_ID", False)
            secret = config.get("CLIENT_SECRET", False)
            scope = config.get("SCOPE", "")
            if not (
                all(
                    [
                        bool(authorization_url),
                        bool(token_url),
                        bool(client_id),
                        bool(secret),
                    ]
                )
            ):
                raise ValueError(f"OAuthHandler has insufficient data for {provider}")
            else:
                # rebuild config
                services[provider.lower()] = {
                    "authorization_url": authorization_url,
                    "token_url": token_url,
                    "client_id": client_id,
                    "secret": secret,
                    "scope": scope,
                }
        # set the config dictionary
        self.services = services

    def front_end_params(self):
        """prepare a service dictionary for front-end: remove secrets"""
        result = {}
        # remove secret from service parameters
        for k, v in self.services.items():
            c = v.copy()
            c.pop("secret")
            result[k] = c
        return result

    def providers(self):
        """Returns a list with stored providers"""
        return list(self.services.keys())

    def get_user_credentials(self, provider, code, redirect_uri=None):
        """Extract User credentials with the help of a code"""
        result = False
        if provider == "github":
            result = self.__handle_github(code)
        elif provider == "orcid":
            result = self.__handle_orcid(code)
        elif provider == "google":
            result = self.__handle_google(code, redirect_uri)
        else:
            raise ValueError(f"Could not find provider {provider}")
        return result

    def __handle_orcid(self, code):
        """Handles OAuth roundtrip for Orcid"""
        # request token
        params = self.services["orcid"]
        response = requests.post(
            params["token_url"],
            data={
                "code": code,
                "client_id": params["client_id"],
                "client_secret": params["secret"],
                "grant_type": "authorization_code",
                "scope": "/authenticate",
            },
            headers={"Accept": "application/json"},
        ).json()
        id = response["orcid"]
        name = response.get("name", "")
        # TODO@Casper: I don't understand why I can't
        # get an email address from the public API. The
        # next call responds with a 401 Unauthorized which
        # doesn't make sense (I've set my email address on 'public')
        # because the call and the scope should OK. Why!?
        # token = response['access_token']
        # response = requests.get(
        #     f'https://api.sandbox.orcid.org/v3.0/{id}/email',
        #     headers={
        #         'Authorization': f'Bearer {token}',
        #         'Accept': 'application/json'
        #     }
        # ).json()
        # print(response.json())
        return (id, "email-unknown", name)

    def __handle_github(self, code):
        """Handles OAuth roundtrip for GitHub"""
        # request token
        params = self.services["github"]
        response = requests.post(
            params["token_url"],
            data={
                "code": code,
                "client_id": params["client_id"],
                "client_secret": params["secret"],
            },
            headers={"Accept": "application/json"},
        ).json()
        # if all is well, we hava a token
        token = response.get("access_token", "")
        # get a user profile
        response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        )
        response = response.json()
        id = response["id"]
        email = response.get("email", "email-unknown")
        name = response["name"] or response["login"] or response["id"]
        return (id, email, name)

    def __handle_google(self, code, redirect_uri):
        # request token
        params = self.services["google"]
        response = requests.post(
            params["token_url"],
            data={
                "code": code,
                "client_id": params["client_id"],
                "client_secret": params["secret"],
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        ).json()
        # if all is well, we hava a token
        token = response.get("access_token", "")
        # get email
        response = requests.post(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            data={"access_token": token},
            headers={"Accept": "application/json"},
        ).json()
        id = response["sub"]
        email = response.get("email", "email-unknown")
        name = (
            response.get("name", False) or response.get("family_name", False) or "Name"
        )
        return (id, email, name)
