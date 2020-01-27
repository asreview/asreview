Balance Strategies
==================

There are several balance strategies that rebalance and reorder the
training data. This is sometimes necessary, because the data is often
very inbalanced: there are many more papers that should be excluded than
included (otherwise, automation cannot help much anyway).

Parameters in the config file should be under the section
``[balance_param]``.

We have currently implemented the following balance strategies:

simple
------

Use all training data.

See :class:`asreview.balance_strategies.SimpleBalance`

undersample
-----------


This undersamples the data, leaving out excluded papers so that the
included and excluded papers are in some particular ratio (closer to
one). Configuration options are as follows:

.. code:: ini

   # Set the ratio of included/excluded to 1
   ratio=1.0

See :class:`asreview.balance_strategies.UndersampleBalance`

triple
------

This divides the training data into three sets: included papers,
excluded papers found with random sampling and papers found with max
sampling. They are balanced according to forumla’s depending on the
percentage of papers read in the dataset, the number of papers with
random/max sampling etc. Works best for stochastic training algorithms.
Reduces to both full sampling and undersampling with corresponding
parameters.

.. code:: ini

 	one_a=2.155
 	one_alpha=0.94
 	zero_b=0.789
 	zero_beta=1.0
 	zero_max_c=0.835
 	zero_max_gamma=2.0
 	shuffle=True

See :class:`asreview.balance_strategies.TripleBalance`

double
------

Same as triple balance, except that it doesn't have a difference between max or random 
sampling.

See :class:`asreview.balance_strategies.DoubleBalance`

