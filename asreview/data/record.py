from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import MappedAsDataclass
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import validates
from sqlalchemy.types import JSON
from sqlalchemy.types import Integer
from sqlalchemy.types import String

from asreview.config import LABEL_NA


class Base(DeclarativeBase, MappedAsDataclass):
    """Base class for records.

    Anyone implementing a custom record type for ASReview should inherit this class.
    This class inherits `DeclarativeBase` which indicates that we are using the
    declarative way of defining models in SQLAlchemy ORM. See
    'https://docs.sqlalchemy.org/en/20/orm/' for more information.

    This class also inherits `MappedAsDataclass`, which means that any class that
    inherits `Base` will automatically be a Python dataclass (i.e. it has
    auto-implementations of `__init__`, `__eq__`, `__repr__`, etc.), and we can call
    `dataclasses.asdict` to turn in instance into a dictionary.

    There are a number of attributes you can customize to make `DataStore` understand
    how to store a record in the database and how to read record data into pandas
    objects. See the comments in the source code.
    """

    # `DataStore` needs to read data from the database and put it in a Pandas dataFrame
    # or series. It needs to know into which datatype each column should be converted.
    # This mapping specifies the conversion from SQLAlchemy datatype to Pandas datatype.
    __sqlalchemy_to_pandas_dtype_mapping__ = {
        Integer: "Int64",
        String: "object",
        JSON: "object",
    }

    # When a data reader reads a file and turns it into records, it needs to know
    # which columns of the input data to put into which columns of the record. By
    # default these should be the same, but you can allow for alternative input column
    # names. For example, ASReview allows both 'title' or 'primary_title' for the
    # title column. The format is {record_column_name: [list of input column names]},
    # where the list of input column names is in order from most important to least
    # important. So when the input dataset contains two possible input columns for a
    # record column, it will pick the first it finds in the list.
    # If a field is not in this mapping, only the record column is allowed as input
    # column.
    __alternative_column_names__ = {}

    # When storing a record, the database needs to know what datatype each field should
    # have. Some types have default values, like `int` for example, but other do not.
    # The following mapping specifies the conversion from Python datatypes to SQLAlchemy
    # datatypes. See https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html#customizing-the-type-map.
    type_annotation_map = {list: JSON}

    # The primary identifier of the record. We always want this to correspond to the
    # row_number of the record in the feature matrix.
    # Ideally this field should be called 'id' instead of 'record_id', but that requires
    # refactoring in the frontend as well, so I'll skip that for now.
    record_id: Mapped[int] = mapped_column(init=False, primary_key=True)

    @classmethod
    def get_columns(cls):
        """Get the list of database column names.

        Returns
        -------
        list[str]
        """
        return [column.name for column in cls.__mapper__.columns]

    @classmethod
    def get_pandas_dtype_mapping(cls):
        """Get the mapping from record column name to pandas data type.

        By default it uses the mapping from `__sqlalchemy_to_pandas_dtype_mapping__`,
        but you can overwrite this method if you need different behavior.

        Returns
        -------
        dict[str, str]
            Dictionary whose keys are record column names and the values are the
            corresponding pandas data type that the column should have when reading it
            into a pandas object.
        """
        return {
            column.name: cls.__sqlalchemy_to_pandas_dtype_mapping__[
                column.type.__class__
            ]
            for column in cls.__mapper__.columns
        }


class Record(Base):
    __tablename__ = "record"
    __table_args__ = (UniqueConstraint("dataset_row", "dataset_id"),)
    # We use dataset_row to locate the record in the original input file of the user.
    # For now I call this 'row', meaning that we will look in the input file by row
    # number. We might want to change this to locate the record by an external
    # identifier provided by the user?
    # Also, maybe we want these two to be on `Base` and not on `Record`? Then anyone
    # implementing a custom record is forced to have them.
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
