FROM python:3.6
RUN pip install asreview asreview-covid19 gevent
ENTRYPOINT ["asreview","lab","--use-gevent"]
CMD ["--ip","0.0.0.0"]
