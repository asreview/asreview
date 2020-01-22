Query Strategies
================

There are a few query strategies available, and depending on the needs
of the simulation/review some will work better than others.

Parameters should be under the section ``[query_param]``.

random
------

As it says: randomly select samples with no regard to model assigned
probabilities.

See :class:`asreview.query_strategies.RandomQuery`


uncertainty
-----------

Choose the most uncertain samples according to the model (i.e. closest
to 0.5 probability). Probably doesn’t work very well in the case of
LSTM’s, since the probabilities are rather arbitrary.

See :class:`asreview.query_strategies.UncertaintyQuery`

max
---

Choose the most likely samples to be included according to the model.

See :func:`asreview.query_strategies.MaxQuery`

cluster
-------

Use clustering after feature extraction on the dataset. Then the highest probabilities
within random clusters are sampled.

See :class:`asreview.query_strategies.ClusterQuery`

mixed
-----

A mix of two query strategies is used. For example mixing max and random sampling means
with a mix ratio of 0.95 would mean that at each query 95% of the instances would be
sampled with the max query strategy after which the remaining 5% would be sampled with
the random query strategy. It would be called the `max_random` query strategy. Every
combination is possible.

See :class:`asreview.query_strategies.MixedQuery`
