try:
    from ldap3 import Server, Connection, ALL, NTLM
except ImportError:
    raise ImportError(
        "LDAP authentication requires the 'ldap3' package. "
        "Install it with: pip install asreview[ldap]"
    )


class LDAPHandler:
    def __init__(self, config=None):
        if not (bool(config) and isinstance(config, dict)):
            raise ValueError("LDAPHandler needs a configuration dictionary.")

        # Required config parameters
        self.server_uri = config.get("SERVER_URI")
        self.bind_dn = config.get("BIND_DN")  # Optional service account
        self.bind_password = config.get("BIND_PASSWORD")  # Optional
        self.user_search_base = config.get("USER_SEARCH_BASE")
        self.user_search_filter = config.get("USER_SEARCH_FILTER", "(uid={username})")

        # Attribute mappings
        self.username_attribute = config.get("USERNAME_ATTRIBUTE", "uid")
        self.email_attribute = config.get("EMAIL_ATTRIBUTE", "mail")
        self.name_attribute = config.get("NAME_ATTRIBUTE", "cn")
        self.affiliation_attribute = config.get("AFFILIATION_ATTRIBUTE", "o")

        # Authentication method
        self.auth_method = config.get("AUTH_METHOD", "SIMPLE")  # SIMPLE, NTLM

        if not all([self.server_uri, self.user_search_base]):
            raise ValueError("LDAPHandler missing required configuration")

    def authenticate_user(self, username, password):
        """Authenticate user against LDAP and return user info"""
        try:
            server = Server(self.server_uri, get_info=ALL)

            # First, find the user's DN
            if self.bind_dn:
                # Use service account to search
                search_conn = Connection(
                    server, self.bind_dn, self.bind_password, auto_bind=True
                )
            else:
                # Anonymous search
                search_conn = Connection(server, auto_bind=True)

            search_filter = self.user_search_filter.format(
                username=username, email=username
            )
            search_conn.search(
                self.user_search_base,
                search_filter,
                attributes=[
                    self.username_attribute,
                    self.email_attribute,
                    self.name_attribute,
                    self.affiliation_attribute,
                ],
            )

            if not search_conn.entries:
                return None  # User not found

            user_entry = search_conn.entries[0]
            user_dn = user_entry.entry_dn
            search_conn.unbind()

            # Now authenticate with user credentials
            if self.auth_method == "NTLM":
                auth_conn = Connection(
                    server,
                    user=user_dn,
                    password=password,
                    authentication=NTLM,
                    auto_bind=True,
                )
            else:
                auth_conn = Connection(
                    server, user=user_dn, password=password, auto_bind=True
                )

            # If we get here, authentication succeeded
            auth_conn.unbind()

            # Extract user information
            identifier = getattr(user_entry, self.username_attribute).value

            email = (
                getattr(user_entry, self.email_attribute).value
                if hasattr(user_entry, self.email_attribute)
                else None
            )

            name = (
                getattr(user_entry, self.name_attribute).value
                if hasattr(user_entry, self.name_attribute)
                else username
            )

            affiliation = (
                getattr(user_entry, self.affiliation_attribute).value
                if hasattr(user_entry, self.affiliation_attribute)
                else None
            )

            return (identifier, email, name, affiliation)

        except Exception:
            # return None for failed authentication
            return None
