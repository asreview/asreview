from asreview.init_sampling import sample_prior_knowledge
from asreview.review import BaseReview
from asreview.review.base import _merge_prior_knowledge


class ReviewSimulate(BaseReview):
    """ Automated Systematic Review in simulation mode. """

    def __init__(self,
                 X,
                 y,
                 *args,
                 n_prior_included=None,
                 n_prior_excluded=None,
                 **kwargs):
        super(ReviewSimulate, self).__init__(
            X, y, *args, **kwargs)

        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded

    def _prior_knowledge(self):
        """ Get the prior knowledge, either from specific paper IDs,
            and if they're not given from the number of in/exclusions. """
        if self.prior_included or self.prior_excluded:
            prior_indices, prior_labels = _merge_prior_knowledge(
                self.prior_included,
                self.prior_excluded
            )

            return prior_indices, prior_labels
        # Create the prior knowledge
        init_ind = sample_prior_knowledge(
            self.y,
            n_prior_included=self.n_prior_included,
            n_prior_excluded=self.n_prior_excluded,
            random_state=None  # TODO
        )

        return init_ind, self.y[init_ind, ]

    def _get_labels(self, ind):
        """ Get the labels directly from memory.

        Arguments
        ---------
        ind: list, np.array
            A list with indices

        Returns
        -------
        list, np.array
            The corresponding true labels for each indice.
        """

        return self.y[ind, ]
