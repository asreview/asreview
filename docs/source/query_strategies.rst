Query Strategies
================

There are a few query strategies available, and depending on the needs
of the simulation/review some will work better than others.

Parameters should be under the section ``[query_param]``.

Random Sampling
---------------

See :func:`asr.query_strategies.random_sampling`

As it says: randomly select samples with no regard to model assigned
probabilities.


Uncertainty Sampling
--------------------

See :func:`asr.query_strategies.uncertainty_sampling`

Choose the most uncertain samples according to the model (i.e. closest
to 0.5 probability). Probably doesn’t work very well in the case of
LSTM’s, since the probabilities are rather arbitrary.

Max Sampling
------------

See :func:`asr.query_strategies.max_sampling`

Choose the most likely samples to be included according to the model.

Random/Max Sampling
-------------------

See :func:`asr.query_strategies.rand_max_sampling`

Use a combination of random and max sampling. By default it does 5%
random sampling and 95% max sampling. Works well in combination with the
triple balance strategy. This parameter can be set in the configuration
file:

.. code:: ini

   # Set to 5% random, 95% max sampling.
   rand_max_frac=0.05
