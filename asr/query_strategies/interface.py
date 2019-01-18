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

from six import with_metaclass

from abc import ABCMeta, abstractmethod


class QueryStrategy(with_metaclass(ABCMeta, object)):

    """Pool-based query strategy

    A QueryStrategy advices on which unlabeled data to be queried next given
    a pool of labeled and unlabeled data.
    """

    def __init__(self, dataset, **kwargs):
        self._dataset = dataset
        dataset.on_update(self.update)

    @property
    def dataset(self):
        """The Dataset object that is associated with this QueryStrategy."""
        return self._dataset

    def update(self, entry_id, label):
        """Update the internal states of the QueryStrategy after each queried
        sample being labeled.

        Parameters
        ----------
        entry_id : int
            The index of the newly labeled sample.

        label : float
            The label of the queried sample.
        """
        pass

    @abstractmethod
    def make_query(self):
        """Return the index of the sample to be queried and labeled. Read-only.

        No modification to the internal states.

        Returns
        -------
        ask_id : int
            The index of the next unlabeled sample to be queried and labeled.
        """
        pass


