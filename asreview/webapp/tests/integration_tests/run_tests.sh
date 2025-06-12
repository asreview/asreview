#!/bin/bash
# Will start an instance of ASReview using docker compose and run integration tests against it.
# Usage: run_tests.sh <arguments>
# Any arguments will be passed on to pytest
# You can override the following defaults using environment variables:
# DRIVER: selenium driver to use (default: firefox)
# PORT: port on which to run ASReview in docker
# TEST_DB_DIR: path to a directory which will be used to create the test database (default: /tmp/asreview_integration_test)
# TEST_DB_NAME: path to the file within TEST_DB_DIR that contains the test database (default: asreview.development.sqlite -- this matches the default Dockerfile's db).
# TEST_REVERSE_PROXY: if set to "true", activates an nginx reverse proxy in front of ASReview. This simulates production environments.
# the test db will be deleted on each run of this script.
# In addition, you can set the TEST_CONFIG_FILE variable to specify a config file under ../config that will be used to start ASReview.
set -e

TEST_DB_DIR="${TEST_DB_DIR:-/tmp/asreview_integration_test}"
TEST_DB_NAME="${TEST_DB_NAME:-asreview.development.sqlite}"
TEST_DB_URI="sqlite:///$TEST_DB_DIR/$TEST_DB_NAME"
TEST_DB_PATH="$TEST_DB_DIR/$TEST_DB_NAME"

TEST_FILES="${TEST_FILES:-tests/integration_tests}"

if [[ "$TEST_REVERSE_PROXY" == "true" ]]; then
    PORT="5432"
    DOCKER_OPTS="--profile reverse-proxy"
else
    PORT="5000"
    DOCKER_OPTS=""
fi

DRIVER="${DRIVER:-firefox}"


PORT="${PORT:-5432}"

if [[ -e "$TEST_DB_PATH" ]]; then
    echo "Removing old test db in $TEST_DB_PATH..."
    rm "$TEST_DB_PATH"
fi

cd "$(dirname "$0")"
echo "Restarting ASReview on http://localhost:$PORT with docker compose"
docker compose down
eval docker compose "$DOCKER_OPTS" up -d

cd ../../ # cd to asreview/webapp folder in this repo
pytest -v "$TEST_FILES" \
    --database-uri "$TEST_DB_URI" \
    --driver "$DRIVER" \
    --url "http://localhost:$PORT" \
    "$@" || echo "Test run failed!"

echo "Stopping docker compose"
cd -
docker compose down
