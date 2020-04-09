import json
import logging

from asreview.webapp.utils.project import read_data


def search_data(project_id, q, n_max=100):
    """Get the title/authors/abstract for a paper."""

    # read the dataset
    as_data = read_data(project_id)

    # search for the keywords
    paper_ids = as_data.fuzzy_find(q, max_return=n_max, exclude=[])

    # return full information on the records
    return as_data.record(paper_ids)


def get_data_statistics(project_id):
    """Get the title/authors/abstract for a paper."""

    # read the dataset
    as_data = read_data(project_id)

    result = {
        "n_rows": as_data.df.shape[0],
        "n_cols": as_data.df.shape[1],
    }

    # return full information on the records
    return result
