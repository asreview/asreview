import pandas as pd

from asreview.state.contextmanager import open_state


def _fill_last_ranking(project, ranking):
    """Fill the last ranking with a random or top-down ranking.

    Arguments
    ---------
    project: asreview.Project
        The project to fill the last ranking of.
    ranking: str
        The type of ranking to fill the last ranking with. Either "random" or
        "top-down".
    """

    if ranking not in ["random", "top-down"]:
        raise ValueError(f"Unknown ranking type: {ranking}")

    as_data = project.read_data()
    record_table = pd.Series(as_data.record_ids, name="record_id")

    with open_state(project.project_path) as state:
        if ranking == "random":
            records = record_table.sample(frac=1)
        elif ranking == "top-down":
            records = record_table

        state.add_last_ranking(records.values, ranking, ranking, ranking, ranking, -1)
