from typing import Optional

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import MappedAsDataclass
from sqlalchemy.orm import validates
from sqlalchemy.types import Integer, String, JSON
from asreview.config import LABEL_NA
from abc import abstractmethod


class Base(DeclarativeBase, MappedAsDataclass):
    __sqlalchemy_to_pandas_dtype_mapping__ = {
        Integer: "Int64",
        String: "object",
        JSON: "object",
    }

    # Mapping { python data type : sqlalchemy data type }
    # See 'Customizing the type map' in the section on 'mapped_column'.
    type_annotation_map = {list: JSON}

    id: Mapped[int] = mapped_column(init=False, primary_key=True)

    @classmethod
    def get_columns(cls):
        return [column.name for column in cls.__mapper__.columns]

    @classmethod
    @abstractmethod
    def get_alternative_columns(cls):
        raise NotImplementedError()

    @classmethod
    def get_pandas_dtype_mapping(cls):
        return {
            column.name: cls.__sqlalchemy_to_pandas_dtype_mapping__[
                column.type.__class__
            ]
            for column in cls.__mapper__.columns
        }


class Record(Base):
    __tablename__ = "record"
    # We use dataset_row to locate the record in the original input file of the user.
    # For now I call this 'row', meaning that we will look in the input file by row
    # number. We might want to change this to locate the record by an external
    # identifier provided by the user.
    dataset_row: Mapped[int]
    dataset_id: Mapped[str]
    title: Mapped[str] = mapped_column(default="")
    abstract: Mapped[str] = mapped_column(default="")
    # authors and keywords could also be in their own separate table.
    authors: Mapped[list] = mapped_column(default=None)
    notes: Mapped[Optional[str]] = mapped_column(default=None)
    keywords: Mapped[list] = mapped_column(default=None)
    year: Mapped[Optional[int]] = mapped_column(default=None)
    doi: Mapped[Optional[str]] = mapped_column(default=None)
    url: Mapped[Optional[str]] = mapped_column(default=None)
    included: Mapped[Optional[int]] = mapped_column(default=LABEL_NA)

    # Alternative names allowed for each column. Each list is ordered from more to less
    # important. If a more important column name is found in a dataset, the lesser names
    # are ignored.
    __alternative_column_names__ = {
        "abstract": ["abstract", "notes_abstract", "abstract note"],
        "authors": ["authors", "first_authors", "author names"],
        "included": [
            "included",
            "label",
            "final_included",
            "label_included",
            "included_label",
            "included_final",
            "included_flag",
            "include",
        ],
        "title": ["title", "primary_title"],
    }

    @classmethod
    def get_alternative_columns(cls):
        return cls.__alternative_column_names__

    @validates("authors")
    def validate_authors(self, key, authors):
        return validate_list(key, authors)

    @validates("keywords")
    def validate_keywords(self, key, keywords):
        return validate_list(key, keywords)

    @validates("included")
    def validate_included(self, key, included):
        if included is None:
            included = LABEL_NA
        if included not in {0, 1, LABEL_NA}:
            raise ValueError(f"'{key}' should be one of 0, 1, or {LABEL_NA}")
        return included


def validate_list(key, value):
    if value is None:
        value = []
    if not isinstance(value, list):
        raise ValueError(f"'{key}' should be a list or None")
    return value
