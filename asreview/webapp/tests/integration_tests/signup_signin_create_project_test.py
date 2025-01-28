import random

import asreview.webapp.tests.integration_tests.utils as utils
from asreview.webapp._authentication.models import Project

ACCOUNT = {
    "email": "test4@user.org",
    "name": "Test User",
    "affiliation": "Utrecht University",
    "password": "@Secret1234!",
}

PROJECT = {
    "mode": "oracle",
    "title": "Project Title",
    "author": ACCOUNT["name"],
    "description": "Project description",
    "dataset": {
        "type": "benchmark",
        "label": "Appenzeller‐Herzog et al. (2019)",
        # alternative:
        # "prior_knowledge_method": "Random",
        # "prior_knowledge": [
        #     "relevant",
        #     "irrelevant",
        #     "relevant",
        #     "irrelevant",
        #     "relevant"
        # ],
        "prior_knowledge_method": "Search",
        "prior_knowledge": [
            ("hepatolenticular degeneration Wilson Zinc", None),
            ("hepatolenticular degeneration Wilson ovulatory", None),
            ("triethylenetetramine dihydrochloride", None),
            ("disease genetic heterogeneity United Kingdom and Taiwan", None),
            ("AIM succimer penicillamine", None),
            ("Early neurological worsening", None),
        ],
    },
    "model": {
        "feature_extractor": "tfidf",
        "classifier": "nb",
        "querier": "max",
        "balancer": "balanced",
    },
}


def test_signup_signin_create_project(driver, url, database_uri, reading_time):
    base_url = url
    driver.get(base_url)

    # setup database session
    session = utils.setup_database_session(database_uri)

    # clean database
    utils.clean_database(session)

    # check if we have a no registered projects
    assert len(session.query(Project).all()) == 0

    # create account
    utils.create_account(driver, base_url, ACCOUNT)

    # sign in
    utils.sign_in(driver, base_url, ACCOUNT)

    # create project
    utils.create_project(driver, base_url, PROJECT, reading_time)

    # check if we have a registered project in the database
    assert len(session.query(Project).all()) == 1

    # REVIEWING
    for _ in range(5):
        # choose
        label = random.choice(["irrelevant", "relevant"])
        # click
        utils.label_abstract(driver, label, reading_time)

    # close driver
    driver.close()
