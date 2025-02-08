import asreview.webapp._entry_points.lab as lab


# test if the app has authentication when --enable-auth
# is an argument
def test_authentication_parameter():
    # run lab with --enable-auth
    app = lab.lab_entry_point(["--test-mode", "--enable-auth"])
    assert app.config.get("AUTHENTICATION")


# test if the app is not configured for authentication,
# authentication should be False
def test_without_authentication_parameter():
    # run lab without --enable-auth
    app = lab.lab_entry_point(["--test-mode"])
    assert app.config.get("AUTHENTICATION") is False
