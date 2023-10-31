import time

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


def click_clickable_element(driver, selector, wait_secs=60):
    """Waits until a clickable element is clickable and clicks
    on it. When <selector> is a String, a CSS selector is
    assumed."""
    if isinstance(selector, str):
        # assume a CSS selector if selector is a string
        selector = (By.CSS_SELECTOR, selector)
    # wait until clickable
    WebDriverWait(driver, wait_secs) \
        .until(EC.element_to_be_clickable(selector))
    # find the element
    element = driver.find_element(*selector)
    # click
    element.click()
    return element


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

    # PAGE 2, DATASET AND PRIOR KNOWLEDGE
    # adding a dataset
    click_clickable_element(driver, "button#add-dataset")

    # choose the dataset
    dataset_button = click_clickable_element(
        driver,
        (By.XPATH, f"//p[text()=\"{project_data['dataset']['label']}\"]")
    )
    # find the button in the parent and click it (it's clickable)
    dataset_button.find_element(By.XPATH, "../../../..//button").click()

    # prior knowledge
    click_clickable_element(driver, "button#add-prior-knowledge")

    # click on randomly adding prior knowledge
    click_clickable_element(
        driver,
        (By.XPATH, f"//span[text()=\"Random\"]")
    )

    # add random prior knowledge
    if project_data["dataset"]["prior_knowledge_method"] == "random":
        for option in project_data["dataset"]["prior_knowledge"]:
            option = option.capitalize()
            assert option in ["Yes", "No"]

            # make sure its clickable
            click_clickable_element(
                driver,
                (By.XPATH, f"//button[text()='{option}']")
            )
    
    # close page 2
    click_clickable_element(
        driver,
        (By.XPATH, "//button[text()='Close']")
    )

    # click on next
    click_clickable_element(driver, "button#next")

    # PAGE 3, MODEL
    # adding a feature extraction
    feature_extr_type = project_data["model"]["feature_extraction"]
    click_clickable_element(driver, "div#select-feature-extraction")
    click_clickable_element(driver, 
        (By.XPATH, f"//li[@data-value=\"{feature_extr_type}\"]")
    )

    WebDriverWait(driver, 30) \
        .until(EC.invisibility_of_element_located(
            (By.XPATH, f"//li[@data-value=\"{feature_extr_type}\"]")
        ))

    # classifier
    classifier = project_data["model"]["classifier"]
    click_clickable_element(driver, "div#select-classifier")
    click_clickable_element(driver,
        (By.XPATH, f"//li[@data-value=\"{classifier}\"]")
    )



    # WebDriverWait(driver, 30).until(EC.invisibility_of_element_located(
    #     (By.XPATH, "//div[@class='MuiBackdrop-root MuiBackdrop-invisible css-esi9ax']")
    # ))
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable(
    #     (By.XPATH, f"//h6[text()='{feature_extr_type}']")
    # )).click()


    # time.sleep(2)

    # # WebDriverWait(driver, 60) \
    # #     .until(EC.invisibility_of_element_located(
    # #         (By.XPATH, "//div[@class='MuiBackdrop-root MuiBackdrop-invisible']")))
    # WebDriverWait(driver, 60) \
    #     .until(EC.presence_of_element_located(
    #         (By.XPATH, f"//h6[text()='{feature_extr_type}']")))

    # click_clickable_element(
    #     driver,
    #     (By.XPATH, f"//h6[text()='{feature_extr_type}']")
    # )






    # # Go to page 3 of modal
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']")))
    # driver.find_element(By.XPATH, "//button[text()='Next']").click()

    # # Go to page 4 of modal
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']")))
    # driver.find_element(By.XPATH, "//button[text()='Next']").click()

    # # Wait until model is trained and we can start
    # WebDriverWait(driver, 60).until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Start Reviewing']")))
    # driver.find_element(By.XPATH, "//button[text()='Start Reviewing']").click()


