from abc import ABC
from abc import abstractmethod

import pandas as pd

from asreview.data.record import Record
from asreview.data.utils import convert_to_list
from asreview.data.utils import standardize_included_label


class BaseReader(ABC):
    """Base class for data readers.

    Reading data from a file happens in three steps: read the raw data, perform data
    cleaning and turn it into `Record` instances. This happens in `read_data`,
    `clean_data` and `to_records`. Anyone implementing a `BaseReader` should provide an
    implementation of `read_data`. There are default implementations of `clean_data` and
    `to_records`. They assume that `read_data` produces a pandas DataFrame. There are a
    number of ways to customize the default cleaning behavior, see the comments next to
    the class attributes.
    """

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
            "asreview_label",
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

    # Dictionary {column name : function to apply to the column} of function that clean
    # the data after reading it. The function should act on individual values.
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
    def read_records(cls, fp, dataset_id, record_cls=Record, *args, **kwargs):
        df = cls.read_data(fp, *args, **kwargs)
        df = cls.clean_data(df)
        return cls.to_records(df, dataset_id=dataset_id, record_cls=record_cls)

    @classmethod
    @abstractmethod
    def read_data(cls, fp, *args, **kwargs):
        """Read the raw data from a file.

        The data type of the output should be equal to the data type of the input of
        `clean_data`. Typically this will mean a pandas DataFrame, but anyone creating a
        custom class can choose a different data type.

        This method should not perform any cleaning of the data. That way data writers
        can add columns to a dataset without changing the original data: Use
        `reader.read_data` to get the data, then add the column, then write away the
        data to a file.

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
        """Clean the raw data.

        Parameters
        ----------
        df : pd.DataFrame
            Data to clean. This should be of the same type as the output of `read_data`.

        Returns
        -------
        pd.DataFrame
            Cleaned data. By default it standardizes the column names, some data types
            and missing values.
        """
        df = cls.standardize_column_names(df)
        for column, cleaning_methods in cls.__cleaning_methods__.items():
            if column in df.columns:
                for cleaning_method in cleaning_methods:
                    df[column] = df[column].apply(cleaning_method)
        if cls.__fillna_default__ is not None:
            df = df.fillna(pd.NA).replace([pd.NA], cls.__fillna_default__)
        return df

    @classmethod
    def to_records(cls, df, dataset_id=None, record_cls=Record):
        """Turn the cleaned data into records.

        Parameters
        ----------
        df : pd.DataFrame
            Cleaned data.
        dataset_id : str, optional
            Identifier of the dataset, by default None
        record_cls : asreview.data.record.Base, optional
            Record class to use, by default Record

        Returns
        -------
        list[Record]
            List of records.
        """
        columns_present = set(df.columns).intersection(set(record_cls.get_columns()))
        columns_present.discard("record_id")
        return [
            record_cls(dataset_row=idx, dataset_id=dataset_id, **row)
            for idx, row in df[list(columns_present)].iterrows()
        ]

    @classmethod
    def standardize_column_names(cls, df):
        """Standardize column names of input data.

        The reader can accept multiple names for a specific type of data, for example
        both 'title' and 'primary_title' could refer to the column containing the title
        data. This function makes sure the correct columns are used. See also the
        attribute `__alternative_column_names__` for customizing this behavior.

        Parameters
        ----------
        df : pd.DataFrame
            Dataframe containing raw data.

        Returns
        -------
        pd.DataFrame
            Dataframe with column names lowercased and stripped of white space. In
            addition, for the columns in `__alternative_column_names__`, the first
            alternative column name in the data will be used as input for the column
            values.
        """
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
