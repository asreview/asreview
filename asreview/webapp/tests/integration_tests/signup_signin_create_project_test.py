import random
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import asreview.webapp.tests.integration_tests.utils as utils

# assumes we have a Docker container of the app running at
# localhost port 8080

BASE_URL = "http://localhost:8080/"

ACCOUNT = {
    "email": "test4@user.org",
    "name": "Test User",
    "affiliation": "Utrecht University",
    "password": "@secret1234!"
}

PROJECT = {
    "mode": "Exploration", # "Oracle", "Simulation"
    "title": "Project Title",
    "author": ACCOUNT["name"],
    "description": "Project description",
    "dataset": {
        "type": "benchmark",
        "label": "Donners et al. (2021)",
        "prior_knowledge_method": "random",
        "prior_knowledge": ["Yes", "No", "Yes", "No", "Yes"]
    },
    "model": {
        "feature_extraction": "TF-IDF",
        "classifier": "Naive Bayes",
        "query_strategy": "Maximum",
        "balance_strategy": "Dynamic resampling (Double)"
    }
}

SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:postgres" \
    "@127.0.0.1:5433/asreview_db"


def test_signup_signin_create_project(driver):
    driver.get(BASE_URL)

    # SETUP  DATABASE
    Session = sessionmaker()
    engine = create_engine(SQLALCHEMY_DATABASE_URI)
    Session.configure(bind=engine)
    session = Session()

    # clean database
    utils.clean_database(session)

    # create account
    utils.create_account(driver, ACCOUNT)
    
    # sign in
    utils.sign_in(driver, ACCOUNT)

    # create project
    utils.create_project(driver, PROJECT)

    # # find the create project button and click on it
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button")))
    # driver.find_element(By.XPATH, "//button[text()='Create']").click()

    # # fill out page 1 of project modal
    # WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//div[@id='mode-select']")))
    # driver.find_element(By.XPATH, "//div[@id='mode-select']").click()
    # driver.find_element(By.XPATH, "//div//h6[text()='Exploration']").click()
    # driver.find_element(By.XPATH, "//input[@id='project-title']").send_keys(PROJECT["title"])
    # driver.find_element(By.XPATH, "//input[@id='project-author']").send_keys(PROJECT["author"])
    # driver.find_element(By.XPATH, "//textarea[@id='project-description']").send_keys(PROJECT["description"])
    # driver.find_element(By.XPATH, "//button[text()='Next']").click()

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

    # # REVIEWING
    # for _ in range(50):
    #     # choose
    #     options = ['Irrelevant', 'Relevant']
    #     label = random.choice(['Irrelevant', 'Relevant'])
    #     print(label)
    #     WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, f"//button[contains(text(), '{label}')]")))
    #     driver.find_element(By.XPATH, f"//button[contains(text(), '{label}')]").click()

    time.sleep(120)