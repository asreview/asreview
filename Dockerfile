FROM python:3.6
RUN pip install asreview
ENTRYPOINT ["asreview","oracle","--ip","0.0.0.0"]
