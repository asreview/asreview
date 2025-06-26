from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime
from datetime import timezone

Base = declarative_base()


class ProjectQueueModel(Base):
    """Queue model"""

    __tablename__ = "queue"
    id = Column(Integer, primary_key=True)
    project_id = Column(String(250), nullable=False, unique=True)
    simulation = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
