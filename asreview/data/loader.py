from io import StringIO
from pathlib import Path

from asreview.datasets import DatasetManager
from asreview.extensions import extensions
from asreview.utils import _get_filename_from_url
from asreview.utils import _is_url


def _from_file(fp, reader=None, dataset_id=None, **kwargs):
    """Create instance from supported file format.

    It works in two ways; either manual control where the conversion
    functions are supplied or automatic, where it searches in the entry
    points for the right conversion functions.

    Arguments
    ---------
    fp: str, pathlib.Path
        Read the data from this file or url.
    reader: BaseReader
        Reader to import the file.
    kwargs: dict
        Keyword arguments passed to `reader.read_records`.
    """

    if reader is not None:
        return reader.read_records(fp, dataset_id=dataset_id, **kwargs)

    # get the filename from a url else file path
    if _is_url(fp):
        fn = _get_filename_from_url(fp)
    else:
        fn = Path(fp).name

    try:
        reader = extensions("readers")[Path(fn).suffix].load()
    except Exception:
        raise ValueError(f"Importing file {fp} not possible.")

    return reader.read_records(fp, dataset_id=dataset_id, **kwargs)


def _from_extension(name, reader=None, dataset_id=None, **kwargs):
    """Load a dataset from extension.

    Arguments
    ---------
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
        # get the filename from a url else file path
        if _is_url(fp):
            fn = _get_filename_from_url(fp)
        else:
            fn = Path(fp).name

        try:
            reader = extensions("readers")[Path(fn).suffix].load()
        except Exception:
            raise ValueError(f"Importing file {fp} not possible.")

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
