# First stage
FROM python:3.11-slim AS builder
WORKDIR /app

# Copy and build asreview
# git is used by versioneer to define the project version
COPY . /app
RUN apt-get update \
    && apt-get install -y git npm build-essential libpq-dev\
    && pip3 install --upgrade pip setuptools \
    && python3 setup.py compile_assets \
    && pip3 install --user gunicorn psycopg2 \
    && pip3 install --user . \
    && pip3 install --user asreview-datatools asreview-insights asreview-makita asreview-wordcloud

# Second stage
FROM python:3.11-slim

VOLUME /project_folder

WORKDIR /app

COPY --from=builder /root/.local /root/.local

ENV ASREVIEW_LAB_HOST=0.0.0.0
ENV PATH=/root/.local/bin:$PATH
ENV ASREVIEW_PATH=/project_folder
EXPOSE 5000

ENTRYPOINT ["asreview"]
