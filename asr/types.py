
def is_pickle(fp):
    """Check file for pickle extension."""
    fp = str(fp)
    return fp.endswith('.pkl') or fp.endswith('.pickle')
