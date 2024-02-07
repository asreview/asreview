Overview
========

ASReview LAB offers three different solutions to run simulations with the:

- :ref:`Webapp (the frontend) <lab/simulation_webapp:simulate via the webapp>`
- :doc:`Command line interface <simulation_cli>`
- :doc:`Python API <simulation_api_example>`


What is a simulation?
---------------------

A simulation involves mimicking the screening process with a certain model. As
it is already known which records are labeled as relevant, the software can
automatically reenact the screening process as if a human was labeling the
records in interaction with the Active Learning model.

Why run a simulation?
---------------------

Simulating with ASReview LAB has multiple purposes. First, the performance of
one or multiple models can be measured by different metrics (see
:ref:`Analyzing results <lab/simulation_results:Analyzing results>`). A convenient one
is that you can investigate the amount of work you could have saved by using
active learning compared to your manual screening process.

Suppose you don't know which model to choose for a new (unlabeled) dataset. In
that case, you can experiment with the best performing combination of the
classifier, feature extraction, query strategy, and balancing and test the
performance on a labeled dataset with similar characteristics.

You could also use the simulation mode to benchmark your own model against
existing models for different available datasets. ASReview LAB allows for adding
new models `via a template
<https://github.com/asreview/template-extension-new-model>`_.

You can also find 'odd' relevant records in a 'classical' search. Such records
are typically found isolated from most other records and might be worth closer
inspection

Datasets for simulation
-----------------------

Simulations require :ref:`fully labeled datasets <lab/data_labeled:fully labeled data>`
(labels: ``0`` = irrelevant, ``1`` = relevant). Such a dataset can be the result of an
earlier study. ASReview offers also fully labeled datasets via the
`SYNERGY dataset <https://github.com/asreview/synergy-dataset>`_. These datasets are
available via the user interface in the *Data* step of the setup and in the command
line with the prefix `synergy:` (e.g. `synergy:van_de_schoot_2018`).

.. tip::

    When you import your data, make sure to remove duplicates and to retrieve
    as many abstracts as possible (`See Importance-of-abstracts blog for help
    <https://asreview.ai/blog/the-importance-of-abstracts/>`_). With clean data you
    benefit most from what :doc:`active learning <about>`
    has to offer.


Cloud environments
------------------

For advanced scenarios, such as executing ASReview simulations in cloud
environments or running them in parallel, consult the specialized `cloud
usage guide <https://github.com/asreview/cloud-usage>`__. This guide provides
tailored instructions for a variety of use cases, including simulations on
cloud platforms such as SURF, Digital Ocean, AWS, Azure, and leveraging
Kubernetes for large-scale simulation tasks. More information can be found in
the paper: `Optimizing ASReview simulations: A generic multiprocessing
solution for 'light-data' and 'heavy-data' users
<https://osf.io/preprints/psyarxiv/9h5ju>`__
