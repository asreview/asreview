import asreview.webapp.tests.integration_tests.utils as utils
from asreview.webapp._authentication.models import User

ACCOUNT = {
    "email": "test4@user.org",
    "name": "Test User",
    "affiliation": "Utrecht University",
    "password": "@Secret1234!",
}


def test_change_profile(driver, url, database_uri):
    base_url = url
    driver.get(base_url)

    # SETUP  DATABASE
    session = utils.setup_database_session(database_uri)

    # clean database
    utils.clean_database(session)

    # assert we have no users
    assert len(session.query(User).all()) == 0

    # create account
    utils.create_account(driver, base_url, ACCOUNT)

    # assert we have a correct user
    assert len(session.query(User).all()) == 1
    user = session.query(User).first()
    session.close()
    assert user.email == ACCOUNT["email"]
    assert user.name == ACCOUNT["name"]
    assert user.affiliation == ACCOUNT["affiliation"]

    # sign in
    utils.sign_in(driver, base_url, ACCOUNT)

    # assert we're on the project dashboard
    assert utils.page_contains_text(driver, "Projects dashboard")

    # go to the profile page
    driver.get(base_url + "/profile")

    new_user_data = {
        "email": "casper@compunist.nl",
        "name": "Casper Kaandorp",
        "affiliation": "UU",
        "old_password": ACCOUNT["password"],
        "password": "uuuuUUUU111",
    }

    utils.fill_text_field_by_id(driver, "email", new_user_data["email"])
    utils.fill_text_field_by_id(driver, "name", new_user_data["name"])
    utils.fill_text_field_by_id(driver, "affiliation", new_user_data["affiliation"])
    utils.fill_text_field_by_id(driver, "oldPassword", new_user_data["old_password"])
    utils.fill_text_field_by_id(driver, "newPassword", new_user_data["password"])
    utils.fill_text_field_by_id(driver, "confirmPassword", new_user_data["password"])
    utils.click_element(driver, "button#save")

    # verify we're on the project dashboard again
    assert driver.current_url == base_url + "/projects"

    # assert we have an updated user
    assert len(session.query(User).all()) == 1
    user = session.query(User).first()
    assert user.email == new_user_data["email"]
    assert user.name == new_user_data["name"]
    assert user.affiliation == new_user_data["affiliation"]

    # log out
    utils.sign_out(driver)

    # log back in with new data
    utils.sign_in(driver, base_url, new_user_data)

    # check if we are on the project dashboard
    assert driver.current_url == base_url + "/projects"

    # close driver
    driver.close()
