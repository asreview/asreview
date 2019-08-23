'''
Expose selection of query methods.
'''

from asreview.query_strategies import max_sampling, random_sampling
from asreview.query_strategies import uncertainty_sampling, rand_max_sampling
from asreview.utils import _unsafe_dict_update


def get_query_strategy(settings):
    """Function to get the query method"""

    method = settings.query_strategy
    if method in ['max', 'max_sampling']:
        return max_sampling, "Maximum inclusion sampling"
    if method in ['rand_max', 'rand_max_sampling']:
        settings.query_kwargs['rand_max_frac'] = 0.05
        settings.query_kwargs = _unsafe_dict_update(
            settings.query_kwargs, settings.query_param)
        return rand_max_sampling, "Mix of random and max inclusion sampling"
    elif method in ['lc', 'sm', 'uncertainty', 'uncertainty_sampling']:
        return uncertainty_sampling, 'Least confidence / Uncertainty sampling'
    elif method == 'random':
        return random_sampling, 'Random'
    else:
        raise ValueError(
            f"Query strategy '{method}' not found."
        )
