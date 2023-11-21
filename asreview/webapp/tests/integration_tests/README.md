# Integration tests (in development)

Besides having unit tests we are also working on integration tests. Unit tests are valuable for isolating and verifying small units of code, while integration tests help ensure that the ASReview web application functions correctly as a whole, considering the collaboration between different components.

Our integration tests interact with the frontend of the application. They enable us to test the user interface but also verify the internal state of the application by, for example, checking the file system (not implemented yet) or the state of the database in an authorized version of the app.

Running integration tests comes with challenges because they interact with an asynchronous frontend. The tests are slower than unit tests and may be brittle: they break when timeouts are reached. With a robust `utils` module we try to overcome the brittleness.

Despite the slower nature of this type of testing it provides valuable information about the interaction between the application's many components. Note that these tests can also be used to quickly setup a project state when you are developing by simply running a number of them. 

## Software

For our integration tests we use [Selenium](https://www.selenium.dev/) and [pytest-selenium](https://pytest-selenium.readthedocs.io/). At the time of this writing there is a problem with the Python `selenium` module, forcing us to use a specific version (4.9.1). We are aware of deprecation warnings after executing the integration tests.

## Using and running the integration tests

The structure of integration tests differs from unit tests. Instead of a number of short unit tests, every integration test module describes a "user story". A user story contains a number of actions in the user interface and a number of assert statements that test whether the actions are reflected in the state of the application.

Before you can execute any integration test, an instance of the ASReview must be running. That might be on Docker, a development instance, even a production instance will work. But note that the tests will have a severe impact on your running application: projects will be created, and in an authorized version user accounts are going to be created as well. __The current modules even clear the database completely before starting__. To avoid data loss we strongly advice to run the integration tests against a dedicated testing instance of the ASReview app. A Docker instance may seem a great solution, but has one drawback: it's hard to reach the filesystem from outside the Docker environment and that filesystem will also be part of the integration tests. 

To run a module with `pytest` one must provide 3 mandatory arguments:
* A browser driver
* A URL where selenium can find the frontend
* A URI where pytest can find the database when you test an authorized version of ASReview

You execute one or more modules with the following command:
```
$ pytest -v -s <path to specific module or integration-test folder> \
    --driver <browser> \
    --url <URL> \
    --database-uri <database URI>
```

Here's a more concrete example:
```
$ pytest -v -s asreview/webapp/tests/integration_tests/signup_signin_create_project_test.py \
    --driver firefox \
    --url http://localhost:3000 \
    --database-uri postgresql+psycopg2://username:password@127.0.0.1:5432/asreview
```
In this concrete example, we are running the frontend of ASReview on local server on port 3000, using FireFox as the test browser, and our authorization PostgreSQL database can also be found on our local server under port 5432.
