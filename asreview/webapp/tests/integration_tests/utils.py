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


def click_clickable_element(driver, css_selector, wait_secs=60):
    WebDriverWait(driver, wait_secs) \
        .until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, css_selector)))
    driver.find_element(By.CSS_SELECTOR, css_selector).click()


def create_account(driver, account_data):
    # browse to signup page
    page = BASE_URL + "/signup"
    browse_to_page(driver, page)

    # link account data to form fields
    form_field_values = [
        ("email", account_data["email"]),
        ("name", account_data["name"]),
        ("affiliation", account_data["affiliation"]),
        ("password", account_data["password"]),
        ("confirmPassword", account_data["password"]),
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
    click_clickable_element(driver, "button#create-profile")


def sign_in(driver, account_data):
    # browse to signin page
    page = BASE_URL + "/signin"
    browse_to_page(driver, page)

    # compile form data
    form_field_values = [
        ("email", account_data["email"]),
        ("password", account_data["password"]),
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
    click_clickable_element(driver, "button#sign-in")


def create_project(driver, project_data):
    # browse to signin page
    page = BASE_URL + "/projects"
    browse_to_page(driver, page)

    # click on the create button when it's available
    click_clickable_element(driver, "button#create-project")

    # PAGE 1 OF MODAL
    # starting with the mode
    WebDriverWait(driver, 60) \
        .until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "div#mode-select")))
    driver.find_element(By.CSS_SELECTOR, "div#mode-select").click()
    driver.find_element(
        By.XPATH,
        f"//h6[text()=\"{project_data['mode']}\"]"
    ).click()

    form_field_values = [
        ("input#project-title", project_data["title"]),
        ("input#project-author", project_data["author"]),
        ("textarea#project-description", project_data["description"])
    ]

    # enter form data
    for field_selector, value in form_field_values:
        driver.find_element(
            By.CSS_SELECTOR,
            field_selector,
        ).send_keys(value)

    # click on next
    click_clickable_element(driver, "button#next")

    # # fill out page 2 of project modal, add a dataset
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Add']")))
    # driver.find_element(By.XPATH, "//button[text()='Add']").click()

    # # select dataset and click 'Add' to add prior knowledge
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'MuiAccordionSummary-expandIconWrapper')]")))
    # first_dataset_option = driver.find_element(By.XPATH, "//div[contains(@class, 'MuiAccordionSummary-expandIconWrapper')]")
    # first_dataset_option.click()
    # first_dataset_option.find_element(By.XPATH, "//button[text()='Add']").click()
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Add']")))
    # driver.find_element(By.XPATH, "//button[text()='Add']").click()

    # # Opt for adding prior knowledge by labeling random records
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//span[text()='Random']")))
    # driver.find_element(By.XPATH, "//span[text()='Random']").click()

    # # Label random data
    # for option in ["Yes", "No", "Yes", "No", "Yes"]:
    #     WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, f"//button[text()='{option}']")))
    #     driver.find_element(By.XPATH, f"//button[text()='{option}']").click()
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Close']")))
    # driver.find_element(By.XPATH, "//button[text()='Close']").click()

    # # Go to page 3 of modal
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']")))
    # driver.find_element(By.XPATH, "//button[text()='Next']").click()

    # # Go to page 4 of modal
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']")))
    # driver.find_element(By.XPATH, "//button[text()='Next']").click()

    # # Wait until model is trained and we can start
    # WebDriverWait(driver, 60).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Start Reviewing']")))
    # driver.find_element(By.XPATH, "//button[text()='Start Reviewing']").click()


