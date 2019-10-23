import json
import os
import re

from asreview.logging import Logger


def get_loggers(data_dir, prefix="result"):
    loggers = {}
    files = os.listdir(data_dir)
    if not files:
        print(f"Error: {data_dir} is empty")
        return None

    for log_file in files:
        if not log_file.startswith(prefix):
            continue

        log_fp = os.path.join(data_dir, log_file)
        loggers[log_file] = Logger.from_file(log_fp, read_only=True).logger

    return loggers


def read_json_results(data_dir):
    """
    Find all results in a directory and read them in memory.
    Assume that all files in this directory have the same model parameters.

    Arguments
    ---------
    data_dir: str
        Directory in which to find any log files.

    Returns
    -------
    dict:
        Dictionary containing the results.
    """
    json_data = {}
    files = os.listdir(data_dir)
    if not files:
        print(f"Error: {data_dir} is empty")
        return None

    min_queries = int(10**9)

    res_files = []
    for json_file in files:
        if not re.match(r'^result', json_file):
            continue

        res_files.append(json_file)
        with open(os.path.join(data_dir, json_file), "r") as fp:
            json_data[json_file] = json.load(fp)

        i = 0
        while i < len(json_data[json_file]):
            if str(i) not in json_data[json_file]:
                min_queries = min(min_queries, i)
                break
            i += 1

    # Make sure they all have the same number of queries.
#     print(f"min_queries: {min_queries}")
    for json_file in res_files:
        i = min_queries
        max_i = len(json_data[json_file])
        while i < max_i:
            if str(i) not in json_data[json_file]:
                break
            del json_data[json_file][str(i)]
#             print(f"Warning: not using query {i} from file {json_file}")
            i += 1
#         print(f"{json_data[json_file].keys()}")

    return json_data


def reorder_results(old_results):
    """
    From a dictionary of results, create a better ordered result.
    The hierarchy of the new dictionary is:
    logname -> query_id -> filename -> data.

    Arguments
    ---------
    old_results: dict
        Results to reorder.

    Returns
    dict:
        Reordered results.
    """
    results = {}

    for fp in old_results:
        for query_i, query in enumerate(old_results[fp]["results"]):
            for logname in query:
                if logname not in results:
                    results[logname] = []
                while len(results[logname]) <= query_i:
                    results[logname].append([])

                results[logname][query_i].append(query[logname])
    return results


def get_num_reviewed(results):
    """ Get the number of queries from the non-reordered results. """
    num_reviewed = []
    for filename in results:
        cur_num = []
        for query in results[filename]["results"]:
            # Count the number of labeled samples each query.
            d_num = len(query["labelled"])
            if len(cur_num) == 0:
                cur_num.append(d_num)
            else:
                cur_num.append(d_num + cur_num[-1])
        # Assert that the number of queries is the same for all files.
        if len(num_reviewed) == 0 or len(cur_num) > len(num_reviewed):
            num_reviewed = cur_num
    return num_reviewed
