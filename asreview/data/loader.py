from io import StringIO
from pathlib import Path

from asreview.datasets import DatasetManager
from asreview.datasets import DatasetNotFoundError
from asreview.exceptions import BadFileFormatError
from asreview.utils import _entry_points
from asreview.utils import _get_filename_from_url
from asreview.utils import is_url


def _from_file(fp, reader=None):
    """Create instance from supported file format.

    It works in two ways; either manual control where the conversion
    functions are supplied or automatic, where it searches in the entry
    points for the right conversion functions.

    Arguments
    ---------
    fp: str, pathlib.Path
        Read the data from this file or url.
    reader: class
        Reader to import the file.
    """

    if reader is not None:
        return reader.read_data(fp)

    # get the filename from a url else file path
    if is_url(fp):
        fn = _get_filename_from_url(fp)
    else:
        fn = Path(fp).name

    try:
        reader = _entry_points(group="asreview.readers")[Path(fn).suffix].load()
    except Exception:
        raise BadFileFormatError(f"Importing file {fp} not possible.")

    return reader.read_data(fp)


def _from_extension(name, reader=None):
    """Load a dataset from extension.

    Arguments
    ---------
    fp: str, pathlib.Path
        Read the data from this file or url.
    reader: class
        Reader to import the file.
    """

    dataset = DatasetManager().find(name)

    if dataset.filepath:
        fp = dataset.filepath
    else:
        # build dataset to temporary file
        reader = dataset.reader()
        fp = StringIO(dataset.to_file())

    if reader is None:
        # get the filename from a url else file path
        if is_url(fp):
            fn = _get_filename_from_url(fp)
        else:
            fn = Path(fp).name

        try:
            reader = _entry_points(group="asreview.readers")[Path(fn).suffix].load()
        except Exception:
            raise BadFileFormatError(f"Importing file {fp} not possible.")

    return reader.read_data(fp)


def load_dataset(name, **kwargs):
    """Load data from file, URL, or plugin.

    Parameters
    ----------
    name: str, pathlib.Path
        File path, URL, or alias of extension dataset.
    **kwargs:
        Keyword arguments passed to the reader.

    Returns
    -------
    asreview.Dataset:
        Inititalized ASReview data object.
    """

    # check is file or URL
    if is_url(name) or Path(name).exists():
        return _from_file(name, **kwargs)

    # check if dataset is plugin dataset
    try:
        return _from_extension(name, **kwargs)
    except DatasetNotFoundError:
        pass

    # Could not find dataset, return None.
    raise FileNotFoundError(f"File, URL, or dataset does not exist: '{name}'")


def load_data(name, **kwargs):
    """Deprecated, use asreview.load_dataset instead.

    Parameters
    ----------
    name: str, pathlib.Path
        File path, URL, or alias of extension dataset.
    **kwargs:
        Keyword arguments passed to the reader.

    Returns
    -------
    asreview.Dataset:
        Inititalized ASReview data object.
    """

    UserWarning(
        "'load_data' is deprecated and will be removed in the future. "
        "Use 'load_dataset' instead."
    )

    return load_dataset(name, **kwargs)
