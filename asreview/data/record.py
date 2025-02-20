from typing import Optional

import pandas as pd
from sqlalchemy import ForeignKey
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import MappedAsDataclass
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import validates
from sqlalchemy.types import JSON
from sqlalchemy.types import Integer
from sqlalchemy.types import String


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
    # Ideally `duplicate_of` would be on the base class, because all record types are
    # required to have it when we do deduplication. However, in the base class we do not
    # yet know the name of the table to which we want to make the foreign key.
    duplicate_of: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("record.record_id", ondelete="SET NULL"), default=None
    )

    title: Mapped[str] = mapped_column(default="")
    abstract: Mapped[str] = mapped_column(default="")
    # authors and keywords could also be in their own separate table.
    authors: Mapped[list] = mapped_column(default_factory=list)
    keywords: Mapped[list] = mapped_column(default_factory=list)
    year: Mapped[Optional[int]] = mapped_column(default=None)
    doi: Mapped[Optional[str]] = mapped_column(default=None)
    url: Mapped[Optional[str]] = mapped_column(default=None)
    included: Mapped[Optional[int]] = mapped_column(default=None)

    @validates("authors", "keywords")
    def validate_list_of_string(self, key, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise ValueError(f"'{key}' should be a list or None, but is: {value}")
        if not all(isinstance(item, str) for item in value):
            raise ValueError(f"'{key}' should be a list of strings")
        return value

    @validates("title", "abstract", "doi", "url")
    def validate_string(self, key, value):
        if value == "":
            return None
        if value is not None and not isinstance(value, str):
            raise ValueError(f"'{key}' should be a string or None, but is: {value}")
        return value

    @validates("included")
    def validate_included(self, key, included):
        if pd.isna(included):
            included = None

        if not (included is None or included in {0, 1}):
            raise ValueError(
                f"included should be one of 0, 1, or None. Not '{included}'"
            )
        return included
