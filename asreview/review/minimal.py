import numpy as np

from asreview.review import BaseReview


class MinimalReview(BaseReview):
    """ Minimal review class, can be used to do reviewing in a granularly. """

    def __init__(self, *args, **kwargs):
        super(MinimalReview, self).__init__(*args, **kwargs)

    def _prior_knowledge(self):
        return np.array([], dtype=np.int), np.array([], dtype=np.int)

    def _get_labels(self, ind):
        raise NotImplementedError
