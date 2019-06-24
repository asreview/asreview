Balance Strategies
==================

There are several balance strategies that rebalance and reorder the
training data. This is sometimes necessary, because the data is often
very inbalanced: there are many more papers that should be excluded than
included (otherwise, automation cannot help much anyway).

Parameters in the config file should be under the section
``[balance_param]``.

We have currently implemented the following balance strategies:

Full Sampling
-------------

See :func:`asr.balance_strategies.full_sample`

This just uses all the data.

Undersampling
--------------

See :func:`asr.balance_strategies.undersample`

This undersamples the data, leaving out excluded papers so that the
included and excluded papers are in some particular ratio (closer to
one). Configuration options are as follows:

.. code:: ini

   # Shuffle the samples
   shuffle=True

   # Set the ratio of included/excluded to 1
   ratio=1.0

Triple Balance
--------------

See :func:`asr.balance_strategies.triple_balance`

This divides the training data into three sets: included papers,
excluded papers found with random sampling and papers found with max
sampling. They are balanced according to forumla’s depending on the
percentage of papers read in the dataset, the number of papers with
random/max sampling etc. Works best for stochastic training algorithms.

.. code:: ini

   # Shuffle the samples
   shuffle=True

   # Start with a random/max weight ratio of 10 at 0% read papers.
   rand_max_b=10

   # Decay to 1 with the following decay exponent:
   rand_max_alpha=1.0

   # Decrease the included/excluded ratio with the power:
   one_zero_beta=0.6

   # Cap the included/excluded ratio at:
   one_zero_delta=0.16
