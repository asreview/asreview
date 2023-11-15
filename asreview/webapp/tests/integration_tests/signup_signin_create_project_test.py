import random
import time

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import asreview.webapp.tests.integration_tests.utils as utils

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


def test_signup_signin_create_project(driver, url, database_uri, reading_time):
    base_url = url
    driver.get(base_url)

    # SETUP  DATABASE
    Session = sessionmaker()
    engine = create_engine(database_uri)
    Session.configure(bind=engine)
    session = Session()

    # clean database
    utils.clean_database(session)

    # create account
    utils.create_account(driver, base_url, ACCOUNT)

    # sign in
    utils.sign_in(driver, base_url, ACCOUNT)

    # create project
    utils.create_project(driver, base_url, PROJECT, reading_time)

    # # REVIEWING
    # for _ in range(50):
    #     time.sleep(reading_time)
    #     # choose
    #     label = random.choice(['Irrelevant', 'Relevant'])
    #     # click
    #     utils.label_abstract(driver, label)
