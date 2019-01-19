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

Uncertainty Sampling

This module contains a class that implements two of the most well-known
uncertainty sampling query strategies: the least confidence method and the
smallest margin method (margin sampling).

"""

import numpy as np

from asr.query_strategies.interface import QueryStrategy


class UncertaintySampling(QueryStrategy):
    """
    Todo: add lcb to comments
          try sm and entropy in code
    """
    """Uncertainty Sampling

    This class implements Uncertainty Sampling active learning algorithm [1]_.

    Parameters
    ----------
    model: :py:class:`libact.base.interfaces.ContinuousModel` or :py:class:`libact.base.interfaces.ProbabilisticModel` object instance
        The base model used for training.

    method: {'lc', 'sm', 'entropy'}, optional (default='lc')
        least confidence (lc), it queries the instance whose posterior
        probability of being positive is nearest 0.5 (for binary
        classification);
        smallest margin (sm), it queries the instance whose posterior
        probability gap between the most and the second probable labels is
        minimal;
        entropy, requires :py:class:`libact.base.interfaces.ProbabilisticModel`
        to be passed in as model parameter;


    Attributes
    ----------
    model: :py:class:`libact.base.interfaces.ContinuousModel` or :py:class:`libact.base.interfaces.ProbabilisticModel` object instance
        The model trained in last query.


    Examples
    --------
    Here is an example of declaring a UncertaintySampling query_strategy
    object:

    .. code-block:: python

       from libact.query_strategies import UncertaintySampling
       from libact.models import LogisticRegression

       qs = UncertaintySampling(
                dataset, # Dataset object
                model=LogisticRegression(C=0.1)
            )

    Note that the model given in the :code:`model` parameter must be a
    :py:class:`ContinuousModel` which supports predict_real method.


    References
    ----------

    .. [1] Settles, Burr. "Active learning literature survey." University of
           Wisconsin, Madison 52.55-66 (2010): 11.
    """

    def __init__(self, pool, method='lc', model=None):
        super(UncertaintySampling, self).__init__(pool)

        self.model = model
        self.method = method
        self._pool = pool

        # if not isinstance(self.model, ContinuousModel) and \
        #         not isinstance(self.model, ProbabilisticModel):
        #     raise TypeError(
        #         "model has to be a ContinuousModel or ProbabilisticModel"
        #     )

        if self.method not in ['lc', 'sm', 'entropy', 'lcb']:
            raise TypeError(
                "supported methods are ['lc', 'sm', 'entropy'], the given one "
                "is: " + self.method)

        # if self.method=='entropy' and \
        #         not isinstance(self.model, ProbabilisticModel):
        #     raise TypeError(
        #         "method 'entropy' requires model to be a ProbabilisticModel"
        #     )

    def make_lcb_score(self, pred_vals):
        included_size = len([x[1] for x in self._pool.data if x[1] == 1])
        training_size = len(
            [x[1] for x in self._pool.data if x[1] is not None])

        pp = included_size / training_size
        pmax = (0.5 + 1 - pp) / 2

        score = np.array([
            py / pmax if py < pmax else (1 - py) / pmax
            for py in pred_vals[:, 1]
        ])
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
            # *self.dataset.get_unlabeled_entries()
            *self._pool.get_unlabeled_entries())

        # if isinstance(self.model, ProbabilisticModel):
        #     dvalue = self.model.predict_proba(X_pool)
        # elif isinstance(self.model, ContinuousModel):
        #     dvalue = self.model.predict_real(X_pool)

        dvalue = self.model.predict(X_pool)

        if self.method == 'lc':  # least confident
            score = -np.max(dvalue, axis=1)

        elif self.method == 'sm':  # smallest margin
            if np.shape(dvalue)[1] > 2:
                # Find 2 largest decision values
                dvalue = -(np.partition(-dvalue, 2, axis=1)[:, :2])
            score = -np.abs(dvalue[:, 0] - dvalue[:, 1])

        elif self.method == 'entropy':
            score = np.sum(-dvalue * np.log(dvalue), axis=1)

        elif self.method == 'lcb':
            score = self.make_lcb_score(dvalue)

        ask_ids = score.argsort()[-n:]

        return [unlabeled_entry_ids[id] for id in ask_ids
                ] if n > 1 else unlabeled_entry_ids[ask_ids[0]]
