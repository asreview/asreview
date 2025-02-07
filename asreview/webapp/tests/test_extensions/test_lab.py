import pytest

import asreview.webapp._entry_points.lab as lab

# test if the app has authentication when --enable-auth
# is an argument
def test_authentication_parameter(client):
    print(client.application.config)
    assert False

# test if the app is not configured for authentication,
# authentication should be False
def test_without_authentication_parameter(client):
    assert False