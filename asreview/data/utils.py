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


def _fix_unclosed_list(value, parse_func, error_type):
    if (value.startswith("['") or value.startswith('["')) and not value.endswith("]"):
        # This is a list, but it is not closed. Try to fix it.
        if value.endswith("'"):
            return parse_func(value + "]")
        elif value.endswith('"'):
            return parse_func(value + "]")
        else:
            try:
                # Try to fix the string by adding a closing bracket.
                return parse_func(value + "']")
            except error_type:
                # If that fails, try adding a closing double quote.
                return parse_func(value + '"]')
    elif value.startswith("['") or value.startswith('["'):
        return parse_func(value)
    else:
        raise error_type(f"Failed to parse {value} as a list value")


def _parse_json_list_from_string(value):
    return _fix_unclosed_list(value, json.loads, json.decoder.JSONDecodeError)


def _parse_literal_list_from_string(value):
    return _fix_unclosed_list(value, literal_eval, SyntaxError)


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

        # Check if the string is a JSON dumped list or a Python literal list value.
        if value[0] == "[":
            try:
                # Try to parse the string as a JSON list.
                return _parse_json_list_from_string(value)
            # If that fails, try to parse it as a Python literal list value.
            except json.decoder.JSONDecodeError:
                # Maybe it's a Python literal value?
                try:
                    return _parse_literal_list_from_string(value)
                except SyntaxError:
                    raise ValueError(
                        f"Can't parse {value} as JSON or Python literal list value"
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
