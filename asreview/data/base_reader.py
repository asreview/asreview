from abc import ABC
from abc import abstractmethod

import pandas as pd

from asreview.data.record import Record
from asreview.data.utils import convert_to_list
from asreview.data.utils import standardize_included_label


class BaseReader(ABC):
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

    __cleaning_methods__ = {
        "authors": [convert_to_list],
        "keywords": [convert_to_list],
        "included": [standardize_included_label],
    }

    # Fill missing values with this value. It should be a tuple with one entry which is
    # the value that will be used to fill all missing values. To disable filling the
    # missing values, put `None` instead of `(None,)`.
    __fillna_default__ = (None,)

    @classmethod
    def read_records(cls, fp, dataset_id, record_class=Record, *args, **kwargs):
        df = cls.read_dataframe(fp, *args, **kwargs)
        print(df)
        df = cls.clean_data(df)
        return cls.to_records(df, dataset_id=dataset_id, record_class=record_class)

    @classmethod
    @abstractmethod
    def read_dataframe(cls, fp, *args, **kwargs):
        """Read data from a file into a Pandas dataframe.

        Anyone implementing a data reader class should inherit this base class. The main
        method to implement is `read_data`, which should produce a Pandas dataframe. The
        base class provides methods for cleaning the data and turning it into records.

        Parameters
        ----------
        fp : Path
            Filepath of the file to read.

        Returns
        -------
        pd.DataFrame
            A dataframe of user input data that has not been cleaned yet.
        """
        raise NotImplementedError

    @classmethod
    def clean_data(cls, df):
        df = cls.standardize_column_names(df)
        for column, cleaning_methods in cls.__cleaning_methods__.items():
            if column in df.columns:
                for cleaning_method in cleaning_methods:
                    df[column] = df[column].apply(cleaning_method)
        if cls.__fillna_default__ is not None:
            df = df.fillna(pd.NA).replace([pd.NA], cls.__fillna_default__)
        return df

    @classmethod
    def to_records(cls, df, dataset_id=None, record_class=Record):
        columns_present = set(df.columns).intersection(set(record_class.get_columns()))
        return [
            record_class(dataset_row=idx, dataset_id=dataset_id, **row)
            for idx, row in df[list(columns_present)].iterrows()
        ]

    @classmethod
    def standardize_column_names(cls, df):
        """For record columns with alternative names, use the first available column."""
        # The original dataset object allowed for uppercase column names.
        # Here I just lowercase all column names, but might cause bugs if we then
        # have two columns with the same name. I.e. 'Title' & 'title' -> 'title'. I
        # assume this won't really happen though.
        df.columns = [col.lower() for col in df.columns]

        # This one also occurred in the original dataset object.
        df.columns = [col.strip() for col in df.columns]

        # Allow for alternative column names.
        for column, alternative_columns in cls.__alternative_column_names__.items():
            if column in df.columns:
                continue
            for alternative_column in alternative_columns:
                if alternative_column in df.columns:
                    df[column] = df[alternative_column]
                    break
        return df
