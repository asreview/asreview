from io import StringIO
from pathlib import Path

from asreview.datasets import DatasetManager
from asreview.extensions import load_extension
from asreview.utils import _get_filename_from_url
from asreview.utils import _is_url


def _get_reader(fp):
    """Get the reader that can read the file at the given file path.

    Parameters
    ----------
    fp : Path
        File path of the file to read.

    Returns
    -------
    asreview.data.base_reader.BaseReader
        Reader instance that can read the file.
    """
    if _is_url(fp):
        fn = _get_filename_from_url(fp)
    else:
        fn = Path(fp).name
    try:
        return load_extension("readers", Path(fn).suffix)
    except ValueError as e:
        raise ValueError(f"No reader found for file at location {fp}") from e


def _get_writer(fp):
    """Get a writer for writing a file to a given location.

    Parameters
    ----------
    fp : Path
        Path where the file will be written to.

    Returns
    -------
    ASReview writer
        The file type and hence the type of writer will be determined based on the
        suffix of the file path.
    """
    try:
        return load_extension("writers", Path(fp).suffix)
    except ValueError as e:
        raise ValueError(f"No writer found for file at location {fp}") from e


def _from_file(fp, reader=None, dataset_id=None, **kwargs):
    """Create instance from supported file format.

    It works in two ways; either manual control where the conversion
    functions are supplied or automatic, where it searches in the entry
    points for the right conversion functions.

    Parameters
    ----------
    fp: str, pathlib.Path
        Read the data from this file or url.
    reader: BaseReader
        Reader to import the file.
    kwargs: dict
        Keyword arguments passed to `reader.read_records`.
    """
    if reader is None:
        reader = _get_reader(fp)
    return reader.read_records(fp, dataset_id=dataset_id, **kwargs)


def _from_extension(name, reader=None, dataset_id=None, **kwargs):
    """Load a dataset from extension.

    Parameters
    ----------
    fp: str, pathlib.Path
        Read the data from this file or url.
    reader: BaseReader
        Reader to import the file.
    kwargs: dict
        Keyword arguments passed to `reader.read_records`.
    """

    dataset = DatasetManager().find(name)

    if dataset.filepath:
        fp = dataset.filepath
    else:
        # build dataset to temporary file
        reader = dataset.reader()
        fp = StringIO(dataset.to_file())

    if reader is None:
        reader = _get_reader(fp)
    return reader.read_records(fp, dataset_id=dataset_id, **kwargs)


def load_dataset(name, dataset_id=None, **kwargs):
    """Load data from file, URL, or plugin.

    Parameters
    ----------
    name: str, pathlib.Path
        File path, URL, or alias of extension dataset.
    **kwargs:
        Keyword arguments passed to the reader.

    Returns
    -------
    list[Record]
        List of records.
    """

    # check is file or URL
    if _is_url(name) or Path(name).exists():
        return _from_file(name, dataset_id=dataset_id, **kwargs)

    # check if dataset is plugin dataset
    try:
        return _from_extension(name, dataset_id=dataset_id, **kwargs)
    except ValueError:
        pass

    # Could not find dataset, return None.
    raise FileNotFoundError(f"File, URL, or dataset does not exist: '{name}'")
