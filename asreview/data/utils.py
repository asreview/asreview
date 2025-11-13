import numpy as np
import pandas as pd
from rispy import LIST_TYPE_TAGS
from rispy import TAG_KEY_MAPPING

# When using a method like `pd.Series.replace` Pandas tries to infer the new data type
# of the series after the replacement. In the future Pandas only does this if you
# explicitly call pd.Series.infer_objects. By setting this option, we silence the
# future deprecation warnings.
pd.set_option("future.no_silent_downcasting", True)

# Character used to join items in a list when converting lists to string.
LIST_JOIN_CHAR = ";"

RIS_LIST_COLUMNS = [TAG_KEY_MAPPING[list_type_tag] for list_type_tag in LIST_TYPE_TAGS]
PANDAS_CSV_MAX_CELL_LIMIT = 131072


def duplicated(df, pid="doi"):
    """Return boolean Series denoting duplicate rows.

    Identify duplicates based on titles and abstracts and if available,
    on a persistent identifier (PID) such as the Digital Object Identifier
    (`DOI <https://www.doi.org/>`_).

    Parameters
    ----------
    df : pd.DataFrame or DataStore
        Dataframe containing columns 'title', 'abstract' and optionally a column
        containing identifiers of type `pid`.
    pid: string
        Which persistent identifier to use for deduplication.
        Default is 'doi'.

    Returns
    -------
    pandas.Series
        Boolean series for each duplicated rows.
    """
    if pid is not None and pid in df.columns:
        # in case of strings, strip whitespaces and replace empty strings with None
        if pd.api.types.is_string_dtype(df[pid]) or pd.api.types.is_object_dtype(
            df[pid]
        ):
            s_pid = df[pid].str.strip().replace("", None)
            if pid == "doi":
                s_pid = s_pid.str.lower().str.replace(
                    r"^https?://(www\.)?doi\.org/", "", regex=True
                )
        else:
            s_pid = df[pid]

        # save boolean series for duplicates based on persistent identifiers
        s_dups_pid = (s_pid.duplicated()) & (s_pid.notnull())
    else:
        s_dups_pid = None

    # get the texts, clean them and replace empty strings with None

    try:
        titles = df["title"]
    except KeyError:
        return df["abstract"]
    try:
        abstracts = df["abstract"]
    except KeyError:
        return df["title"]

    s_title = pd.Series(titles).fillna("")
    s_abstract = pd.Series(abstracts).fillna("")

    s = (
        (s_title + " " + s_abstract)
        .str.strip()
        .str.replace("[^A-Za-z0-9]", "", regex=True)
        .str.lower()
        .str.strip()
        .replace("", None)
    )

    # save boolean series for duplicates based on titles/abstracts
    s_dups_text = (s.duplicated()) & (s.notnull())

    # final boolean series for all duplicates
    if s_dups_pid is not None:
        s_dups = s_dups_pid | s_dups_text
    else:
        s_dups = s_dups_text

    return s_dups


def convert_ris_list_columns_to_string(df):
    for col in RIS_LIST_COLUMNS:
        if col in df.columns:
            df[col] = (
                df[col]
                .str.join(LIST_JOIN_CHAR)
                .str.slice(stop=PANDAS_CSV_MAX_CELL_LIMIT)
            )
    return df


def convert_value_to_list(value):
    """Convert a value to a list."""
    if isinstance(value, list):
        return value
    elif isinstance(value, np.ndarray):
        return value.tolist()
    elif pd.isna(value):
        return []
    elif isinstance(value, str):
        return value.split(LIST_JOIN_CHAR)
    else:
        raise ValueError(
            f"value should be of type `list`, `np.ndarray` or `str`. Value: {value}"
        )


def convert_value_to_int(value):
    if pd.api.types.is_integer(value):
        return int(value)
    elif pd.isna(value):
        return None
    elif pd.api.types.is_number(value) and int(value) == value:
        return int(value)
    elif isinstance(value, str):
        try:
            return int(value)
        except ValueError as e:
            raise ValueError(
                f"value should be an integer but is a string. Value: {value}"
            ) from e
    else:
        raise ValueError(
            f"value should be an integer. Value: {value}; type: {type(value)}"
        )


def standardize_included_label(value):
    replacement_dict = {
        "": None,
        pd.NA: None,
        np.nan: None,
        "0": 0,
        "1": 1,
        "yes": 1,
        "no": 0,
        "y": 1,
        "n": 0,
    }
    if value in replacement_dict:
        return replacement_dict[value]
    else:
        return value
