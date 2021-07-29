#!/bin/bash
# Otto Mättas
###
# This script will spin up the latest development environment
# for both back end and front end servers of ASReview.
###
# Vers. tabel
# v0.1 Duplicate setup from DEVELOPMENT.md (https://github.com/asreview/asreview/blob/master/DEVELOPMENT.md)

export LC_ALL=C

# Pull latest updates from official Github
echo "Pulling latest changes from Github"
git fetch upstream
git pull upstream master
wait

# Install latest ASReview via pip
echo "Installing latest ASReview back end via pip..."
pip install -e .

# Set Flask environment
export FLASK_ENV=development

# Start the backend server
if ! pgrep -f "asreview" > /dev/null; then
    asreview lab &
fi
echo "Starting back end server..."
wait

# Navigate to front end
cd asreview/webapp

# Install the latest front end
echo "Installing latest ASReview fron end via npm..."
npm install

# Beautify the code
echo "Beautifying front end code..."
npx prettier --write .

# Start the front end
echo "Starting front end server..."
npm start &

# Print end
echo " "
echo "################################################"
echo "### ASREVIEW DEVELOPMENT ENVIRONMENT STARTED ###"
echo "################################################"
echo " "
