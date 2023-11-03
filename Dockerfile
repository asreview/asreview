# First stage
FROM python:3.11-slim AS builder
ARG PORT=5000

WORKDIR /app

# Copy and build asreview
# git is used by versioneer to define the project version
COPY . /app

# create .env file for frontend to find backend
RUN echo "REACT_APP_API_URL=http://localhost:$PORT/" > /app/asreview/webapp/.env

RUN apt-get update \
    && apt-get install -y git npm libpq-dev\
    && pip3 install --upgrade pip setuptools \
    && python3 setup.py compile_assets \
    && pip3 install --user . \
    && pip3 install --user asreview-datatools asreview-insights asreview-makita asreview-wordcloud

# Second stage
FROM python:3.11-slim
ARG PORT=5000

VOLUME /project_folder

WORKDIR /app

COPY --from=builder /root/.local /root/.local

ENV PORT=$PORT
ENV ASREVIEW_HOST=0.0.0.0
ENV PATH=/root/.local/bin:$PATH
ENV ASREVIEW_PATH=/project_folder
EXPOSE $PORT

ENTRYPOINT ["asreview", "lab"]
