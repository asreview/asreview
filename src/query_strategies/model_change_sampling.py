""" Model Change Sampling

"""

import sys
import os

from query_strategies.interface import QueryStrategy
from query_strategies.uncertainty_sampling import UncertaintySampling


class ModelChangeSampling(QueryStrategy):

    """Model Change Sampling

    This class implements Model Change Sampling active learning algorithm [1]_.

    Parameters
    ----------
    model: 

    method: 

    Attributes
    ----------
    model: :py:class:`libact.base.interfaces.ContinuousModel` or :py:class:`libact.base.interfaces.ProbabilisticModel` object instance
        The model trained in last query.


    """

    def __init__(self, pool, method='lcbmc', model=None, prev_score= None):
        super(ModelChangeSampling, self).__init__(pool)

        self.model = model
        self.method = method
        self._pool = pool
        self.prev_score = prev_score

        if self.method not in ['lcbmc']:
            raise TypeError(
                "supported methods are ['lcbmc'], the given one "
                "is: " + self.method
            )

        
    def make_lcbmc(self, pred_vals):
        qs = UncertaintySampling(
                self._pool, method='lcb', model=self.model)
        lcb_score = qs.make_lcb_score(pred_vals)
        
        if self.prev_score.size ==0:
             score = lcb_score
        else:        
            training_size = len([x[1] for x in self._pool.data if x[1] is not None])
            w0 = 1/training_size
            score = lcb_score + w0* self.prev_score
        return score
        
    def make_query(self, n=1):
        """Return the index of the sample to be queried and labeled and
        selection score of each sample. Read-only.

        No modification to the internal states.

        Returns
        -------
        ask_id : int, list
            The index of the next unlabeled sample to be queried and labeled.

        """

        unlabeled_entry_ids, X_pool = zip(
            *self._pool.get_unlabeled_entries()
        )

        
        dvalue = self.model.predict(X_pool)
        if self.method == 'lcbmc':
            self.score = self.make_lcbmc(dvalue)

        ask_ids = self.score.argsort()[-n:]

        return [unlabeled_entry_ids[id] for id in ask_ids] if n > 1 else unlabeled_entry_ids[ask_ids[0]]
