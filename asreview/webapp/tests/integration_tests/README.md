# Integration tests (in development)

In a comprehensive testing strategy, both unit tests and integration tests play important roles. Unit tests are valuable for isolating and verifying small units of code, while integration tests help ensure that the ASReview web application functions correctly as a whole, considering the collaboration between different components.

The integration tests interact with the frontend of the application. They test the user interface but also verify the internal state of the application by, for example, checking the file system (not implemented yet) or the state of the database in an authorized version of the app.

Running integration tests comes with challenges because they interact with an asynchronous frontend. The tests are slower than unit tests and are potentially brittle: they break when timeouts are reached. With a robust `utils` module we try to overcome this brittleness.

Despite the slower nature of this type of testing it provides valuable information about the interaction between the application's many components. Note that these tests can also be used to quickly setup a project state and populate the database in development mode by simply running a number of them.

## Software

For the integration tests [pytest-selenium](https://pytest-selenium.readthedocs.io/) is used.

## Using and running the integration tests

The structure of integration tests differs from unit tests. Instead of a number of short unit tests, every integration test module describes a "user story". A user story contains a number of actions in the user interface and a number of assert statements that test whether the actions are reflected in the application's state.

Before any integration test can be executed, an instance of the ASReview must be running. That might be on Docker, a development instance, even a production instance will work. But note that the tests will have a severe impact on the running application: projects will be created, and in an authorized version user accounts are going to be created as well. **The current modules even clear the database completely before starting**.

To avoid data loss, it is recommended to run the integration tests against a dedicated testing instance of the ASReview app. A Docker instance may seem a great solution, but has one drawback: it's hard to reach the filesystem from outside the Docker environment and that filesystem will eventually also be part of the integration-test suite.

To run a module/test with `pytest` one must provide 3 mandatory arguments:

- --driver: a browser driver
- --url: a URL where selenium can find the frontend
- --database-uri: a URI where pytest can find the database when an authorized version of ASReview is tested

There is another optional argument `--reading-time` which expects an integer value N that forces the test to wait N seconds before it labels a record as relevant or irrelevant. It simulates the reading time it takes for an end user to make a decision about the relevance of a record.

Use the following command to execute one or more modules:

```
$ pytest -v -o <path to specific module or integration-test folder> \
    --driver <browser> \
    --url <URL> \
    --database-uri <database URI>
```

Here's a more concrete example:

```
$ pytest -v -o asreview/webapp/tests/integration_tests/signup_signin_create_project_test.py \
    --driver firefox \
    --url http://localhost:3000 \
    --database-uri postgresql+psycopg2://username:password@127.0.0.1:5432/asreview
```

In this concrete example, the test is executed against the frontend of ASReview that runs on a local server on port 3000, using FireFox as the test browser, and the authorization PostgreSQL database can also be found under local host, port 5432.
