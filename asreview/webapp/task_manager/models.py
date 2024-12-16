from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ProjectQueueModel(Base):
    """Queue model"""

    __tablename__ = "queue"
    id = Column(Integer, primary_key=True)
    project_id = Column(String(250), nullable=False, unique=True)
    simulation = Column(Boolean, nullable=False, default=False)
