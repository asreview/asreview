import random

import pytest
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
    "password": "@Secret1234!"
}

# mode: "oracle", "explore", "simulate"
# feature-extraction: # doc2vec, embedding-idf, sbert, embedding-lstm, tfidf
# classifier: logistic, lstm-base, lstm-pool, nb, nn-2-layer, rf, svm
# query_strategy: cluster, max, max_random, max_uncertainty, random, uncertainty
# balance_strategy: double, simple, undersample
PROJECT = {
    "mode": "explore",
    "title": "Project Title",
    "author": ACCOUNT["name"],
    "description": "Project description",
    "dataset": {
        "type": "benchmark",
        "label": "Donners et al. (2021)",
        "prior_knowledge_method": "Random",
        "prior_knowledge": ["Yes", "No", "Yes", "No", "Yes"]
        # "prior_knowledge_method": "Search",
        # "prior_knowledge": [
        #     ("medicine", None),
        #     ("medicine", None),
        #     ("medicine", None),
        #     ("medicine", None),
        #     ("medicine", None)
        # ]
    },
    "model": {
        "feature_extraction": "tfidf",
        "classifier": "nb",
        "query_strategy": "max",
        "balance_strategy": "double"
    }
}


SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://postgres:postgres" \
    "@127.0.0.1:5433/asreview_db"

@pytest.fixture(scope="session")
def url(pytestconfig):
    return pytestconfig.getoption("url")


def test_signup_signin_create_project(driver, url):
    base_url = url
    driver.get(base_url)

    # SETUP  DATABASE
    Session = sessionmaker()
    engine = create_engine(SQLALCHEMY_DATABASE_URI)
    Session.configure(bind=engine)
    session = Session()

    # clean database
    utils.clean_database(session)

    # create account
    utils.create_account(driver, base_url, ACCOUNT)

    # sign in
    utils.sign_in(driver, base_url, ACCOUNT)

    # create project
    utils.create_project(driver, base_url, PROJECT)

    # REVIEWING
    for _ in range(50):
        # choose
        label = random.choice(['Irrelevant', 'Relevant'])
        # click
        utils.label_abstract(driver, label)
