# ASReview Test Suite

This folder contains the test suite of the ASReview app. It is organized in the following folders:

## Fixtures

Fixture inheritance

## Goals

Unit test like for API tests, a single test tests one thing, randomize tests to ensure independence

## Running the tests

### Running tests

```
$ cd <path to tests>
$ python3 -m pytest test_asreview_database.py -s
```

pytest --random-order -s -v ./asreview/webapp/tests/test_api/