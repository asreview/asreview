import numpy as np

AVAILABLE_CLI_MODI = ["oracle", "simulate"]
AVAILABLE_REVIEW_CLASSES = ["oracle", "simulate", "minimal"]

DEMO_DATASETS = {
    "example_ptsd": "https://raw.githubusercontent.com/msdslab/automated-systematic-review-datasets/master/datasets/Van_de_Schoot_PTSD/output/PTSD_VandeSchoot_18.csv"  # noqa
}

NOT_AVAILABLE = np.nan

KERAS_MODELS = ["lstm_base", "lstm_pool"]

# CLI defaults
DEFAULT_MODEL = "lstm_pool"
DEFAULT_QUERY_STRATEGY = "rand_max"
DEFAULT_BALANCE_STRATEGY = "triple_balance"
DEFAULT_N_INSTANCES = 20
DEFAULT_N_PRIOR_INCLUDED = 10
DEFAULT_N_PRIOR_EXCLUDED = 10

GITHUB_PAGE = "https://github.com/msdslab/automated-systematic-review"
EMAIL_ADDRESS = "asreview@uu.nl"
