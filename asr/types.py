
def is_pickle(fp):
    """Check file for pickle extension."""
    fp = str(fp)
    return fp.endswith('.pkl') or fp.endswith('.pickle')


def convert_list_type(x, to_type=int):
    """Convert elements in list to given type."""

    return list(map(to_type, x))
