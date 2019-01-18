"""
@techreport{YY2017,
  author = {Yao-Yuan Yang and Shao-Chuan Lee and Yu-An Chung and Tung-En Wu and Si-An Chen and Hsuan-Tien Lin},
  title = {libact: Pool-based Active Learning in Python},
  institution = {National Taiwan University},
  url = {https://github.com/ntucllab/libact},
  note = {available as arXiv preprint \\url {https://arxiv.org/abs/1710.00379}},
  month = oct,
  year = 2017
    }    
"""

"""Random Sampling
"""
from asr.query_strategies.interface import QueryStrategy
import numpy as np

class RandomSampling(QueryStrategy):

    r"""Random sampling

    This class implements the random query strategy. A random entry from the
    unlabeled pool is returned for each query.

    Parameters
    ----------
    random_state : {int, np.random.RandomState instance, None}, optional (default=None)
        If int or None, random_state is passed as parameter to generate
        np.random.RandomState instance. if np.random.RandomState instance,
        random_state is the random number generate.

    Attributes
    ----------
    random_states\_ : np.random.RandomState instance
        The random number generator using.

    Examples
    --------
    Here is an example of declaring a RandomSampling query_strategy object:

    .. code-block:: python

       from libact.query_strategies import RandomSampling

       qs = RandomSampling(
                dataset, # Dataset object
            )
    """

    def __init__(self, dataset, **kwargs):
        super(RandomSampling, self).__init__(dataset, **kwargs)

        random_state = kwargs.pop('random_state', None)
        self.random_state_ = self.seed_random_state(random_state)

    def seed_random_state(self,seed):
        """Turn seed into np.random.RandomState instance
        """
        if (seed is None) or (isinstance(seed, int)):
            return np.random.RandomState(seed)
        elif isinstance(seed, np.random.RandomState):
            return seed
        raise ValueError("%r can not be used to generate numpy.random.RandomState"
                        " instance" % seed)

    # @inherit_docstring_from(QueryStrategy)
    def make_query(self, n=1):

        dataset = self.dataset
        unlabeled_entry_ids, _ = zip(*dataset.get_unlabeled_entries())
        entry_id = self.random_state_.choice(
            unlabeled_entry_ids,
            size=n,
            replace=False
        )
        return list(entry_id) if n > 1 else entry_id[0]
