from asreview.review import BaseReview


class MinimalReview(BaseReview):
    """Automated Systematic Review"""

    def __init__(self, *args, **kwargs):
        super(MinimalReview, self).__init__(*args, **kwargs)

    def _prior_knowledge(self):
        raise NotImplementedError

    def _get_labels(self, ind):
        raise NotImplementedError
