
def signup_user(client, user):
    """Signs up a user through the api"""
    response = client.post(
        "/auth/signup",
        data={
            "identifier": user.email,
            "email": user.email,
            "name": user.name,
            "password": user.password,
            "origin": "asreview",
        },
    )
    return response