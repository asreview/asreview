import time
import os

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from asreview.webapp._authentication.models import Project
from asreview.webapp._authentication.models import User

SELENIUM_SCREENSHOT_DIR = os.getenv("SELENIUM_SCREENSHOT_DIR", "/tmp")
ASREVIEW_LAB_POST_LOGOUT_URL = os.getenv("ASREVIEW_LAB_POST_LOGOUT_URL", "/signin")


def save_screenshot(driver, name="screenshot", dirpath=SELENIUM_SCREENSHOT_DIR):
    os.makedirs(dirpath, exist_ok=True)
    driver.save_screenshot(f"{dirpath}/{name}.png")


def setup_database_session(uri):
    Session = sessionmaker()
    engine = create_engine(uri)
    Session.configure(bind=engine)
    return Session()


def clean_database(session):
    session.query(Project).delete()
    session.query(User).delete()
    session.commit()


def browse_to_page(driver, page):
    driver.get(page)
    assert driver.current_url == page


def click_element(driver, selector, wait_secs=60, selector_type=By.CSS_SELECTOR):
    """Waits until a clickable element is clickable and clicks
    on it. When <selector> is a String, a CSS selector is
    assumed."""
    if isinstance(selector, str):
        selector = (selector_type, selector)
    # wait until clickable
    WebDriverWait(driver, wait_secs).until(EC.element_to_be_clickable(selector))
    # find the element
    element = driver.find_element(*selector)
    # click
    element.click()
    return element


def select_from_dropdown(driver, parent, data_value):
    click_element(driver, parent)
    element = (By.XPATH, f'//li[@data-value="{data_value}"]')
    click_element(driver, element)
    WebDriverWait(driver, 60).until(EC.invisibility_of_element_located(element))


# TODO APPLY THIS FUNCTION
def fill_text_field_by_id(driver, field_id, value, wait_time=60):
    selector = (By.CSS_SELECTOR, f"input#{field_id}")
    WebDriverWait(driver, wait_time).until(EC.presence_of_element_located(selector))

    input_field = driver.find_element(*selector)

    # input_field.clear() does not work for all fields when using chromedriver:
    # fields that have autofill enabled are re-filled after being cleared.
    # instead, just clear the fields manually:
    while not input_field.get_attribute("value") == "":
        input_field.send_keys(Keys.BACK_SPACE)

    input_field.send_keys(value)


def create_account(driver, base_url, account_data):
    # browse to signup page
    page = base_url + "/signin"
    browse_to_page(driver, page)

    click_element(driver, "button#create-profile")

    # link account data to form fields
    form_field_values = [
        ("email", account_data["email"]),
        ("name", account_data["name"]),
        ("affiliation", account_data["affiliation"]),
        ("password", account_data["password"]),
        ("confirmPassword", account_data["password"]),
    ]

    # make sure we got the input fields ready
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, f"input#{form_field_values[0][0]}")
        )
    )

    # enter form data
    for field_id, value in form_field_values:
        driver.find_element(By.CSS_SELECTOR, f"input#{field_id}").send_keys(value)

    # wait until create button is clickable and enabled
    click_element(driver, "button#create-profile")


def sign_in(driver, base_url, account_data):
    # browse to signin page
    page = base_url + "/signin"
    browse_to_page(driver, page)

    # compile form data
    form_field_values = [
        ("email", account_data["email"]),
        ("password", account_data["password"]),
    ]

    # make sure we got the input fields ready
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, f"input#{form_field_values[0][0]}")
        )
    )

    # enter form data
    for field_id, value in form_field_values:
        driver.find_element(By.CSS_SELECTOR, f"input#{field_id}").send_keys(value)

    # click on signin button (it must be visible)
    click_element(driver, "button#sign-in")


def sign_out(driver, base_url, post_logout_url=ASREVIEW_LAB_POST_LOGOUT_URL):
    click_element(driver, "[aria-label='account of current user'")
    click_element(driver, "//p[contains(text(), 'Sign out')]", selector_type=By.XPATH)
    wait_for_redirect(driver, f"{base_url}{post_logout_url}")


def page_contains_text(
    driver, text, selector="body", selector_type=By.CSS_SELECTOR, wait_time=60
):
    # wait until the text is visible
    WebDriverWait(driver, wait_time).until(
        EC.text_to_be_present_in_element((selector_type, selector), text)
    )
    return True


def wait_for_redirect(driver, redirect_url, wait_time=10):
    print(f"Waiting for redirect to: {redirect_url}")
    WebDriverWait(driver, wait_time).until(
        lambda driver: driver.current_url == redirect_url
    )


def label_abstract(driver, label, reading_time=0):
    # sleep to simulate reading time
    time.sleep(reading_time)
    # make sure we're dealing with lowercase characters
    label = label.lower().strip()
    # check if label is correct
    assert label in ["irrelevant", "relevant"]
    # click appropriate button
    click_element(driver, f"button#{label}")


def _label_prior_knowledge_abstract(driver, label=None, reading_time=0):
    # Use prior label if label is None
    if label is None:
        # find first element that has class labeled-as
        label = driver.find_element(By.CSS_SELECTOR, "div.labeled-as").text
    # proceed with actual labeling
    label_abstract(driver, label, reading_time)


def _label_random_prior_knowledge(driver, project_data, reading_time):
    # click on randomly adding prior knowledge
    click_element(driver, (By.XPATH, '//span[text()="Random"]'))

    # add random prior knowledge
    for label in project_data["dataset"]["prior_knowledge"]:
        _label_prior_knowledge_abstract(driver, label, reading_time)


def _label_searched_prior_knowledge(driver, project_data, reading_time):
    # make the Search choice
    click_element(driver, (By.XPATH, '//span[text()="Search"]'))

    # Work the expected search terms, send the strings and wait
    # for the result before we can label.
    for search_term, label in project_data["dataset"]["prior_knowledge"]:
        # fill out search input
        driver.find_element(By.CSS_SELECTOR, "input#search-input").send_keys(
            search_term
        )
        # click search button
        click_element(driver, "button#search")

        # wait until we have a result
        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.search-result"))
        )

        # label first abstract
        _label_prior_knowledge_abstract(driver, label, reading_time)

        # clear search input
        driver.find_element(By.CSS_SELECTOR, "input#search-input").clear()


def create_project(driver, base_url, project_data, reading_time=0):
    # browse to signin page
    page = base_url + "/reviews"
    browse_to_page(driver, page)

    # click on the create button when it's available
    click_element(driver, "button#create-project")

    # PAGE 1 OF MODAL
    # starting with the mode
    select_from_dropdown(driver, "div#mode-select", project_data["mode"])

    form_field_values = [
        ("input#project-title", project_data["title"]),
        ("input#project-author", project_data["author"]),
        ("textarea#project-description", project_data["description"]),
    ]

    # enter form data
    for field_selector, value in form_field_values:
        driver.find_element(
            By.CSS_SELECTOR,
            field_selector,
        ).send_keys(value)

    # click on next
    click_element(driver, "button#next")

    # PAGE 2, DATASET AND PRIOR KNOWLEDGE
    # adding a dataset
    click_element(driver, "button#add-dataset")

    # choose the dataset
    dataset_button = click_element(
        driver, (By.XPATH, f'//p[text()="{project_data["dataset"]["label"]}"]')
    )
    # find the button in the parent and click it (it's clickable)
    dataset_button.find_element(By.XPATH, "../../../..//button").click()

    # Adding prior knowledge
    click_element(driver, "button#add-prior-knowledge")

    if project_data["dataset"]["prior_knowledge_method"] == "Random":
        _label_random_prior_knowledge(driver, project_data, reading_time)
    else:
        _label_searched_prior_knowledge(driver, project_data, reading_time)

    # close page 2
    click_element(driver, (By.XPATH, "//button[text()='Close']"))

    # click on next
    click_element(driver, "button#next")

    # PAGE 3, MODEL
    # adding feature extraction mode
    feature_extr_type = project_data["model"]["feature_extractor"]
    select_from_dropdown(driver, "div#select-feature-extraction", feature_extr_type)

    # classifier
    classifier = project_data["model"]["classifier"]
    select_from_dropdown(driver, "div#select-classifier", classifier)

    # query stratgey
    querier = project_data["model"]["querier"]
    select_from_dropdown(driver, "div#select-query-strategy", querier)

    # balance strategy
    balancer = project_data["model"]["balancer"]
    select_from_dropdown(driver, "div#select-balance-strategy", balancer)

    # click on next
    click_element(driver, "button#next")

    # Wait until model is trained and so we can start
    click_element(driver, "button#start-reviewing", wait_secs=300)
