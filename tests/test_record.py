from asreview.data.record import Base
from asreview.data.record import Record
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column


def test_record():
    assert Record.get_columns() == {
        "id",
        "dataset_id",
        "dataset_row",
        "included",
        "title",
        "authors",
        "abstract",
        "notes",
        "doi",
        "keywords",
        "url",
        "year",
    }

    assert Record.get_pandas_dtype_mapping() == {
        "id": "Int64",
        "dataset_id": "object",
        "dataset_row": "Int64",
        "included": "Int64",
        "title": "object",
        "authors": "object",
        "abstract": "object",
        "notes": "object",
        "doi": "object",
        "keywords": "object",
        "url": "object",
        "year": "Int64",
    }


def test_custom_record():
    class CustomRecord(Base):
        __tablename__ = "foo_table"
        __sqlalchemy_to_pandas_dtype_mapping__ = {
            Integer: "foo",
            String: "bar",
        }

        foo_col: Mapped[int] = mapped_column(primary_key=True)
        bar_col: Mapped[str]

    assert CustomRecord.get_columns() == {"foo_col", "bar_col"}
    assert CustomRecord.get_pandas_dtype_mapping() == {
        "foo_col": "foo",
        "bar_col": "bar",
    }
