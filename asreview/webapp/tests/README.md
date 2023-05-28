# ASReview Test Suite

This folder contains the test suite of the ASReview app. It is organized in the following folders:

* __config__: Contains data to create user accounts and a number of json files to start the ASReview app in different modes (e.g. authenticated, authentication with verification, etc).

* __data__: Contains project data used in tests.

* __integration_tests__: Contains integration tests. Integration tests differ from all other tests in this suite. They startup a browser with Selenium and interact with it to conduct full-stack tests. These tests are slow!

* __test_api__: Contains API related tests. These tests are independent, unit-like tests.

* __test_database_and_models__: Contains tests that focus on basic database operations and several SQL_Alchemy models that are used in the authenticated version of the ASReview app.

* __test_extensions__: blabla

## Fixtures

If you are unfamiliar with Pytest: fixtures enable a setup and teardown system for all tests. They ensure a controlled initial state and clean up afterwards to make sure the next test is conducted with a clean slate. 

In our case, all fixtures are defined in `conftest.py` files. These files are automatically picked up by Pytest and can be found in the test-folder (root), but also in nested folders. The nested modules build on top of the the `conftest.py` file in the root-folder.

## Goals

Unit test like for API tests, a single test tests one thing, randomize tests to ensure independence

## Running the tests

### Running tests

```
$ cd <path to tests>
$ python3 -m pytest test_asreview_database.py -s
```

pytest --random-order -s -v ./asreview/webapp/tests/test_api/