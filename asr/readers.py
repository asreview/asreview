# Cpython dependencies


# external dependencies
from RISparser import TAG_KEY_MAPPING, readris


def read_ris(fp, labels=None):
    """RIS file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the RIS file.
    label: bool
        Check for label. If None, this is automatic.

    Returns
    -------
    list:
        List with entries.

    """

    # build a map of the tags
    mapping = TAG_KEY_MAPPING

    if labels:
        mapping["LI"] = "label_included"

    with open(fp, 'r') as bibliography_file:
        entries = list(readris(bibliography_file, mapping=mapping))

    return entries
