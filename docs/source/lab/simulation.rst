﻿Simulation Mode
================

At the moment, the ASReview simulation mode is only available in the command
line interface. When using the :ref:`ASReview command line interface for
simulation <API/cli:Simulate>`, a fully labeled dataset is required (labeling
decisions: ``0`` = irrelevant, ``1`` = relevant).

See the following resources for  information on running a simulation:

- :ref:`ASReview command line interface for simulation <API/cli:Simulate>`
- :doc:`../guides/simulation_study_results`
- :doc:`../guides/sim_overview`


.. warning::

    If you upload your own data, make sure to remove duplicates and to retrieve 
    as many abstracts as possible (`don't know how?
    <https://asreview.nl/the-importance-of-abstracts/>`_). With clean data you
    benefit most from what :doc:`active learning <../guides/activelearning>` 
    has to offer. 
