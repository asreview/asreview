FROM python:3.6
RUN pip install asreview asreview-covid19
ENTRYPOINT ["asreview","oracle","--ip","0.0.0.0"]
