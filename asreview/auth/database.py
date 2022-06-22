import os.path

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from asreview.utils import asreview_path

db_path = os.path.join(asreview_path(), 'auth.sqlite')
engine = create_engine(f'sqlite:///{db_path}')
db_session = scoped_session(
    sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )
)

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    import asreview.auth.models
    Base.metadata.create_all(bind=engine)

