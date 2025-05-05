import json
from ast import literal_eval

import numpy as np
import pandas as pd


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


def convert_to_list(value):
    """Convert a value to a list.

    This function tries to be very permissive in what input it allows. The goal is
    to accept input from as many different kinds of input files as possible. If you
    are certain what format the input has, you are probably better of parsing that
    format directly.
    """
    if isinstance(value, list):
        return value
    elif isinstance(value, np.ndarray):
        return value.tolist()
    elif pd.isna(value):
        return []
    elif isinstance(value, str):
        if value == "":
            return []
        if value[0] == "[":
            # Check if it's a json dumped list.
            try:
                return json.loads(value)
            except json.decoder.JSONDecodeError:
                # Maybe it's a Python literal value?
                try:
                    return literal_eval(value)
                except SyntaxError:
                    raise ValueError(
                        "value is a string starting with '[', but is not a JSON"
                        " dumped list or a Python literal list value."
                        f" Value: {value}"
                    )
        # Assume it is a list of items separated by one of ,;:
        longest_split = []
        for sep in {",", ";", ":"}:
            split_value = value.split(sep)
            if len(split_value) > len(longest_split):
                longest_split = split_value
        # Remove excess whitespace in case the items were separated by ', ' for example.
        return [item.strip() for item in longest_split]
    else:
        raise ValueError(
            f"value should be of type `list`, `np.ndarray` or `str`. Value: {value}"
        )


def standardize_included_label(value):
    if isinstance(value, str):
        conversion_dict = {
            "": None,
            "0": 0,
            "1": 1,
            "yes": 1,
            "no": 0,
            "y": 1,
            "n": 0,
        }
        value = value.lower()
        value = conversion_dict[value]
    if pd.isna(value):
        value = None
    return value
