import requests

class OAuthHandler:

    def __init__(self, configs=None):
        if not(bool(configs) and isinstance(configs, dict))  :
            raise f'OAuthHandler needs a configuration dictionary.'

        # check if all necessary config parameters are there
        services = {}
        for provider, config in configs.items():
            # get required parameters
            authorization_url = config.get('AUTHORIZATION_URL', False)
            token_url = config.get('TOKEN_URL', False)
            client_id = config.get('CLIENT_ID', False)
            secret = config.get('CLIENT_SECRET', False)
            scope = config.get('SCOPE', '')
            if not(all([bool(authorization_url), bool(token_url),
                bool(client_id), bool(secret)])):
                raise f'OAuthHandler has insufficient data for f{provider}'
            else:
                # rebuild config
                services[provider.lower()] = {
                    'authorization_url': authorization_url,
                    'token_url': token_url,
                    'client_id': client_id,
                    'secret': secret,
                    'scope': scope,
                }
        # set the config dictionary
        self.services = services


    def front_end_params(self):
        """prepare a service dictionary for front-end: remove secrets"""
        result = {}
        # remove secret from service parameters
        for k, v in self.services.items():
            c = v.copy()
            c.pop('secret')
            result[k] = c
        return result


    def providers(self):
        """Returns a list with stored providers"""
        return list(self.services.keys())


    def get_user_credentials(self, provider, code, redirect_uri=None):
        """Extract User credentials with the help of a code"""
        result = False
        if provider == 'github':
            result = self.__handle_github(code)
        elif provider == 'orcid':
            result = self.__handle_orcid(code)
        elif provider == 'google':
            result = self.__handle_google(code, redirect_uri)
        else:
            raise f'Could not find provider {provider}'
        return result
        

    def __handle_orcid(self, code):
        """Handles OAuth roundtrip for Orcid"""
        # request token
        params = self.services['orcid']
        response = requests.post(
            params['token_url'], 
            data={
                'code': code,
                'client_id': params['client_id'],
                'client_secret': params['secret'],
                'grant_type': 'authorization_code'
            },
            headers={'Accept': 'application/json'}
        ).json()
        id = response['orcid']
        name = response.get('name', '')
        token = response['access_token']
        return (id, 'email', name)


    def __handle_github(self, code):
        """Handles OAuth roundtrip for GitHub"""
        # request token
        params = self.services['github']
        response = requests.post(
            params['token_url'], 
            data={
                'code': code,
                'client_id': params['client_id'],
                'client_secret': params['secret'],
            },
            headers={'Accept': 'application/json'}
        ).json()
        # if all is well, we hava a token
        token = response.get('access_token', '')
        # get a user profile
        response = requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
        )
        response = response.json()
        id = response['id']
        email = response.get('email', 'no-email-found')
        name = response['name'] or response['login'] or response['id']
        return (id, email, name) 


    def __handle_google(self, code, redirect_uri):
        # request token
        print(redirect_uri)
        params = self.services['google']
        response = requests.post(
            params['token_url'], 
            data={
                'code': code,
                'client_id': params['client_id'],
                'client_secret': params['secret'],
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri
            },
            headers={'Accept': 'application/json'}
        ).json()
        # if all is well, we hava a token
        token = response.get('access_token', '')
        # get email
        response = requests.post(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            data = {'access_token': token},
            headers={'Accept': 'application/json'}
        ).json()
        id = response['sub']
        email = response.get('email', 'no-email-found')
        name = response.get('name', False) or \
            response.get('family_name', False) or 'Name'
        return (id, email, name)
        
