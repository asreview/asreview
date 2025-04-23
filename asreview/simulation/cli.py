# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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
from sklearn.utils import check_random_state

from asreview import load_dataset
from asreview.datasets import DatasetManager
from asreview.learner import ActiveLearningCycle
from asreview.learner import ActiveLearningCycleData
from asreview.models.models import get_ai_config
from asreview.models.queriers import TopDown
from asreview.models.stoppers import IsFittable
from asreview.models.stoppers import LastRelevant
from asreview.models.stoppers import NLabeled
from asreview.project.api import Project
from asreview.simulation.simulate import Simulate
from asreview.utils import _format_to_str
from asreview.utils import _read_config_file


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

    # set the seeds
    np.random.seed(args.seed)

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
        )
        project.add_dataset(args.dataset, dataset_id=filename)
        data_store = project.data_store
    else:
        data_store = load_dataset(args.dataset, dataset_id=filename)

    prior_idx = args.prior_idx
    if args.prior_record_id is not None and len(args.prior_record_id) > 0:
        prior_idx = _convert_id_to_idx(data_store, args.prior_record_id)

    stopper = LastRelevant() if args.n_stop is None else NLabeled(args.n_stop)

    if args.config_file:
        cycle_meta = ActiveLearningCycleData(**_read_config_file(args.config_file))
    elif args.classifier or args.querier or args.balancer or args.feature_extractor:
        cycle_meta = ActiveLearningCycleData(
            querier=args.querier,
            classifier=args.classifier,
            balancer=args.balancer,
            feature_extractor=args.feature_extractor,
            n_query=args.n_query,
        )
    else:
        cycle_meta = get_ai_config(args.ai.lower())["value"]

    cycles = [
        ActiveLearningCycle(
            querier=TopDown(),
            stopper=IsFittable(),
        ),
        ActiveLearningCycle.from_meta(cycle_meta),
    ]

    sim = Simulate(
        data_store.get_df(),
        data_store["included"],
        cycles,
        stopper=stopper,
    )

    # select or sample prior knowledge and then label it
    if len(prior_idx) > 0:
        print("Selected prior knowledge via --prior-idx:\n")
        for record in data_store.get_records(prior_idx):
            _print_record(record)

        sim.label(prior_idx)

    if args.n_prior_included > 0:
        r = check_random_state(args.prior_seed)

        included_idx = np.where(data_store["included"] == 1)[0]
        if len(included_idx) < args.n_prior_included:
            raise ValueError(
                f"Number of included priors requested ({args.n_prior_included})"
                f" is bigger than number of included records "
                f"({len(included_idx)})."
            )
        sim.label(r.choice(included_idx, args.n_prior_included, replace=False))

    if args.n_prior_excluded > 0:
        r = check_random_state(args.prior_seed)

        excluded_idx = np.where(data_store["included"] == 0)[0]
        if len(excluded_idx) < args.n_prior_excluded:
            raise ValueError(
                f"Number of excluded priors requested ({args.n_prior_excluded})"
                f" is bigger than number of excluded records "
                f"({len(excluded_idx)})."
            )
        sim.label(r.choice(excluded_idx, args.n_prior_excluded, replace=False))

    sim.review()

    if args.output is not None:
        project.add_review(reviewer=sim, status="finished")

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
        "--ai",
        type=str,
        default=get_ai_config()["name"],
        help=f"The AI to simulate with. Default {get_ai_config()['name']}.",
    )
    parser.add_argument(
        "-c",
        "--classifier",
        type=str,
        help="The classifier for active learning. Default: 'nb'.",
    )
    parser.add_argument(
        "-q",
        "--querier",
        type=str,
        help="The querier for active learning. Default: 'max'.",
    )
    parser.add_argument(
        "-b",
        "--balancer",
        type=str,
        dest="balancer",
        help="Data rebalancing strategy mainly for RNN methods. Helps against"
        " imbalanced dataset with few inclusions and many exclusions. "
        "Default: 'balanced'",
    )
    parser.add_argument(
        "-e",
        "--feature-extractor",
        type=str,
        help="Feature extraction algorithm. Some combinations of feature"
        " extractors and classifiers are not supported or feasible. Default: 'tfidf'.",
    )
    parser.add_argument(
        "--prior-seed",
        type=int,
        help="Seed for selecting prior records if the --prior-idx option is "
        "not used. If the option --prior-idx is used with one or more "
        "index, this option is ignored.",
    )
    parser.add_argument(
        "--seed",
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
        type=int,
        help="The number of label actions to simulate. If not set, simulation stops "
        "after last relevant was found. Use -1 to simulate all label actions.",
    )

    # configuration file
    parser.add_argument(
        "--config-file",
        type=Path,
        help="Configuration file for learning cycle.",
    )

    # output and verbosity
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        help="Location to ASReview project file of simulation.",
    )

    parser.add_argument("--verbose", "-v", default=0, type=int, help="Verbosity")
    return parser
