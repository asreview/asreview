from typing import Optional

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import MappedAsDataclass
from sqlalchemy import Integer, String


class Base(DeclarativeBase):
    __sqlalchemy_to_pandas_dtype_mapping__ = {
        Integer: "Int64",
        String: "object",
    }

    @classmethod
    def get_columns(cls):
        return [column.name for column in cls.__mapper__.columns]

    @classmethod
    def get_pandas_dtype_mapping(cls):
        return {
            column.name: cls.__sqlalchemy_to_pandas_dtype_mapping__[column.type.__class__]
            for column in cls.__mapper__.columns
        }


class Record(MappedAsDataclass, Base):
    __tablename__ = "record"
    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    # We use dataset_row to locate the record in the original input file of the user.
    # For now I call this 'row', meaning that we will look in the input file by row
    # number. We might want to change this to locate the record by an external
    # identifier provided by the user.
    dataset_row: Mapped[int]
    dataset_id: Mapped[str]
    title: Mapped[Optional[str]] = mapped_column(default=None)
    abstract: Mapped[Optional[str]] = mapped_column(default=None)
    # authors and keywords could also be in their own separate table.
    authors: Mapped[Optional[str]] = mapped_column(default=None)
    notes: Mapped[Optional[str]] = mapped_column(default=None)
    keywords: Mapped[Optional[str]] = mapped_column(default=None)
    year: Mapped[Optional[int]] = mapped_column(default=None)
    doi: Mapped[Optional[str]] = mapped_column(default=None)
    url: Mapped[Optional[str]] = mapped_column(default=None)
    included: Mapped[Optional[int]] = mapped_column(default=None)
