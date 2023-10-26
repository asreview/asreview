from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User

BASE_URL = "http://localhost:8080"


def clean_database(session):
    session.query(Project).delete()
    session.query(User).delete()
    session.commit()


def browse_to_page(driver, page):
    driver.get(page)
    assert driver.current_url == page


def create_account(driver, account_data):
    # browse to signup page
    page = BASE_URL + "/signup"
    browse_to_page(driver, page)

    # link account data to form fields
    form_field_values = [
        ('email', account_data["email"]),
        ('name', account_data["name"]),
        ('affiliation', account_data["affiliation"]),
        ('password', account_data["password"]),
        ('confirmPassword', account_data["password"]),
    ]

    # make sure we got the input fields ready
    WebDriverWait(driver, 60) \
        .until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, f"input#{form_field_values[0][0]}")))

    # enter form data
    for field_id, value in form_field_values:
        driver.find_element(
            By.CSS_SELECTOR,
            f"input#{field_id}"
        ).send_keys(value)

    # wait until create button is clickable and create profile
    WebDriverWait(driver, 60) \
        .until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "button#create-profile")))
    driver.find_element(By.CSS_SELECTOR, "button#create-profile").click()


def sign_in(driver, account_data):
    # browse to signin page
    page = BASE_URL + "/signin"
    browse_to_page(driver, page)

    # compile form data
    form_field_values = [
        ('email', account_data["email"]),
        ('password', account_data["password"]),
    ]

    # make sure we got the input fields ready
    WebDriverWait(driver, 60) \
        .until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, f"input#{form_field_values[0][0]}")))

    # enter form data
    for field_id, value in form_field_values:
        driver.find_element(
            By.CSS_SELECTOR,
            f"input#{field_id}"
        ).send_keys(value)

    # click on signin button (it must be visible)
    driver.find_element(By.CSS_SELECTOR, "button#sign-in").click()


def create_project(driver, project_data):
    pass
