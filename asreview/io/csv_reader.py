import pandas as pd
from asreview.io.utils import standardize_dataframe


def read_csv(data_fp):
    """CVS file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the CSV file.

    Returns
    -------
    list:
        List with entries.

    """
    try:
        df = pd.read_csv(data_fp)
    except UnicodeDecodeError:
        df = pd.read_csv(data_fp, encoding="ISO-8859-1")
    return standardize_dataframe(df)
