# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Simulation entry point and utils."""

import argparse
import logging
import re
import shutil
from pathlib import Path

import numpy as np

from asreview import load_dataset
from asreview.data import DataStore
from asreview.datasets import DatasetManager
from asreview.extensions import load_extension
from asreview.project.api import Project
from asreview.settings import ReviewSettings
from asreview.simulation.simulate import Simulate
from asreview.types import type_n_queries
from asreview.utils import _format_to_str


def _set_log_verbosity(verbose):
    if verbose == 0:
        logging.getLogger().setLevel(logging.WARNING)
    elif verbose == 1:
        logging.getLogger().setLevel(logging.INFO)
    elif verbose >= 2:
        logging.getLogger().setLevel(logging.DEBUG)


def _convert_id_to_idx(data_obj, record_id):
    """Convert record_id to row number."""

    inv_record_id = dict(zip(data_obj.df.index.tolist(), range(len(data_obj))))

    result = []
    for i in record_id:
        try:
            result.append(inv_record_id[i])
        except KeyError:
            raise KeyError(f"record_id {i} not found in data.")

    return result


def _unpack_params(params):
    if params is None:
        return {}

    return params


def _print_record(record, use_cli_colors=True):
    """Format one record for displaying in the CLI.

    Parameters
    ----------
    record: Record
        The record to format.
    use_cli_colors: bool
        Some terminals support colors, set to True to use them.

    Returns
    -------
    str:
        A string including title, abstracts and authors.
    """
    if record.title is not None:
        title = record.title
        if use_cli_colors:
            title = "\033[95m" + title + "\033[0m"
        title += "\n"
    else:
        title = ""

    if record.authors is not None and len(record.authors) > 0:
        authors = _format_to_str(record.authors) + "\n"
    else:
        authors = ""

    if record.abstract is not None and len(record.abstract) > 0:
        abstract = record.abstract
        abstract = "\n" + abstract + "\n"
    else:
        abstract = ""

    if record.included == 0:
        label = "IRRELEVANT"
    elif record.included == 1:
        label = "RELEVANT"
    else:
        label = ""

    header = f"---{record.record_id}---{label}---"

    print(f"\n{header:-<60}\n{title}{authors}{abstract}")


def _cli_simulate(argv):
    # parse arguments
    parser = _simulate_parser()
    args = parser.parse_args(argv)

    # change the verbosity
    _set_log_verbosity(args.verbose)

    if args.output and Path(args.output).exists():
        raise ValueError("Project path already exists.")

    # Get a name for the dataset
    if re.match(r"^([a-zA-Z0-9_-]+)\:([a-zA-Z0-9_-]+)$", args.dataset):
        ds = DatasetManager().find(args.dataset)
        filename = ds.filename
    else:
        filename = Path(args.dataset).name

    # create a new settings object from arguments
    settings = ReviewSettings(
        classifier=args.classifier,
        query_strategy=args.query_strategy,
        balance_strategy=args.balance_strategy,
        feature_extraction=args.feature_extraction,
        n_stop=args.n_stop,
    )

    if args.config_file:
        settings.from_file(args.config_file)

    # set the seeds
    # TODO: set seeds in the settings object
    # TODO: seed also other tools like tensorflow
    np.random.seed(args.seed)

    classifier_class = load_extension("models.classifiers", settings.classifier)
    classifier_model = classifier_class(**_unpack_params(settings.classifier_param))

    query_class = load_extension("models.query", settings.query_strategy)
    query_model = query_class(**_unpack_params(settings.query_param))

    if settings.balance_strategy is None:
        balance_model = None
    else:
        balance_class = load_extension("models.balance", settings.balance_strategy)
        balance_model = balance_class(**_unpack_params(settings.balance_param))

    feature_model = load_extension(
        "models.feature_extraction", settings.feature_extraction
    )(**_unpack_params(settings.feature_param))

    # prior knowledge
    if (
        args.prior_idx is not None
        and args.prior_record_id is not None
        and len(args.prior_idx) > 0
        and len(args.prior_record_id) > 0
    ):
        raise ValueError("Not possible to provide both prior-idx and prior-record-id")

    if args.output is not None:
        # write all results to the project file
        fp_tmp_simulation = Path(args.output).with_suffix(".asreview.tmp")

        project = Project.create(
            fp_tmp_simulation,
            project_id=Path(args.output).stem,
            project_mode="simulate",
            project_name=Path(args.output).stem,
            project_description="Simulation created via ASReview via "
            "command line interface",
        )
        project.add_dataset(args.dataset, dataset_id=filename)
        data_store = project.data_store
    else:
        records = load_dataset(args.dataset, dataset_id=filename)
        data_store = DataStore(":memory:")
        data_store.create_tables()
        data_store.add_records(records)

    prior_idx = args.prior_idx
    if args.prior_record_id is not None and len(args.prior_record_id) > 0:
        prior_idx = _convert_id_to_idx(data_store, args.prior_record_id)

    fm = feature_model.from_data_store(data_store)

    print("The following records are prior knowledge:\n")
    for record in data_store.get_records(prior_idx):
        _print_record(record)

    sim = Simulate(
        fm,
        data_store["included"],
        classifier=classifier_model,
        query_strategy=query_model,
        balance_strategy=balance_model,
        feature_extraction=feature_model,
        n_query=args.n_query,
        n_stop=args.n_stop,
    )
    if len(prior_idx) > 0:
        sim.label(prior_idx, prior=True)

    if args.n_prior_included > 0 or args.n_prior_excluded > 0:
        sim.label_random(
            n_included=args.n_prior_included,
            n_excluded=args.n_prior_excluded,
            prior=True,
            random_state=args.prior_seed,
        )
    sim.review()

    if args.output is not None:
        # Project exists because it was created in previous `if args.output`.
        project.add_feature_matrix(fm, feature_model)
        project.add_review(settings=settings, reviewer=sim, status="finished")

        # export the project file
        project.export(args.output)
        shutil.rmtree(fp_tmp_simulation)

    else:
        print("\nTo store the results, use the -o option. E.g. -o my_sim.asreview")


DESCRIPTION_SIMULATE = """
ASReview for simulation.

The simulation modus is used to measure the performance of the ASReview
software on existing systematic reviews. The software shows how many
records you could have potentially skipped during the systematic
review."""


def _simulate_parser(prog="simulate", description=DESCRIPTION_SIMULATE):
    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog=prog,
        description=description,
        formatter_class=argparse.RawTextHelpFormatter,
    )

    # active learning parameters
    # File path to the data.
    parser.add_argument(
        "dataset",
        type=str,
        help="File path to the dataset or one of the benchmark datasets.",
    )
    # Initial data (prior knowledge)
    parser.add_argument(
        "--n-prior-included",
        default=0,
        type=int,
        help="Sample n prior included records. "
        "Only used when --prior-idx is not given. Default 0.",
    )

    parser.add_argument(
        "--n-prior-excluded",
        default=0,
        type=int,
        help="Sample n prior excluded records. "
        "Only used when --prior-idx is not given. Default 0.",
    )

    parser.add_argument(
        "--prior-idx",
        default=[],
        nargs="*",
        type=int,
        help="Prior indices by rownumber (0 is first rownumber).",
    )
    parser.add_argument(
        "--prior-record-id",
        default=[],
        nargs="*",
        type=int,
        help="Prior indices by record-id.",
    )
    parser.add_argument(
        "-c",
        "--classifier",
        type=str,
        default="nb",
        help="The classifier for active learning. Default: 'nb'.",
    )
    parser.add_argument(
        "-q",
        "--query-strategy",
        type=str,
        default="max",
        help="The query strategy for active learning. Default: 'max'.",
    )
    parser.add_argument(
        "-b",
        "--balance-strategy",
        type=str,
        dest="balance_strategy",
        default="balanced",
        help="Data rebalancing strategy mainly for RNN methods. Helps against"
        " imbalanced dataset with few inclusions and many exclusions. "
        "Default: 'balanced'",
    )
    parser.add_argument(
        "--no-balance-strategy",
        action="store_const",
        const=None,
        dest="balance_strategy",
        help="Do not use a balance strategy.",
    )
    parser.add_argument(
        "-e",
        "--feature-extraction",
        type=str,
        default="tfidf",
        help="Feature extraction method. Some combinations of feature"
        " extraction method and prediction model are impossible/ill"
        " advised. Default: 'tfidf'.",
    )
    parser.add_argument(
        "--prior-seed",
        default=None,
        type=int,
        help="Seed for selecting prior records if the --prior-idx option is "
        "not used. If the option --prior-idx is used with one or more "
        "index, this option is ignored.",
    )
    parser.add_argument(
        "--seed",
        default=None,
        type=int,
        help="Seed for the model (classifiers, balance strategies, "
        "feature extraction techniques, and query strategies).",
    )
    parser.add_argument(
        "--n-query",
        default=1,
        type=int,
        help="Number of records queried each query. Default 1.",
    )
    parser.add_argument(
        "--n-stop",
        type=type_n_queries,
        default="min",
        help="The number of label actions to simulate. Default, 'min' "
        "will stop simulating when all relevant records are found. Use -1 "
        "to simulate all labels actions.",
    )

    # configuration file
    parser.add_argument(
        "--config-file",
        type=str,
        default=None,
        help="Configuration file with model settings and parameter values.",
    )

    # output and verbosity
    parser.add_argument(
        "--output",
        "-o",
        default=None,
        type=str,
        help="Location to ASReview project file of simulation.",
    )

    parser.add_argument("--verbose", "-v", default=0, type=int, help="Verbosity")
    return parser
