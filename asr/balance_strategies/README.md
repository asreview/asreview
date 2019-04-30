# Balance Strategies

There are several balance strategies that rebalance and reorder the training data. This is sometimes necessary, because the data is often very inbalanced: there are many more papers that should be excluded than included (otherwise, automation cannot help much anyway).

We have currently implemented the following balance strategies:

### [Full Sampling](full_sampling.py)

This just uses all the data.

### [Undersampling](under_sampling.py)

This undersamples the data, leaving out excluded papers so that the included and excluded papers are in some particular ratio (closer to one).

### [Triple Balance](triple_balance.py)

This divides the training data into three sets: included papers, excluded papers found with random sampling and papers found with max sampling. They are balanced according to forumla's depending on the percentage of papers read in the dataset, the number of papers with random/max sampling etc. Works best for stochastic training algorithms.
