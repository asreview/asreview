Get Started
===========

What is ASReview LAB?
---------------------

ASReview LAB is an open source machine learning tool for screening and
labeling large collection of data in a systematic way. It's sometimes refered
as a tool for title and abstract screening in systematic reviews.

ASReview LAB is one of the products of the ASReview research project.



With the emergence of online publishing, the number of scientific papers and
policy reports on any topic is skyrocketing. Simultaneously, the public press
and social media also produce data by the second. Suppose you are writing a
systematic review or meta-analysis, updating a medical guideline, developing
evidence-based policy, or scouting for new technologies. In that case, you
need to systematically search for potentially relevant documents to provide a
comprehensive overview. To achieve this, you have to search and screen
thousands of studies by hand for inclusion. This process is an extremely
imbalanced data problem because truly relevant papers are very sparse.
Moreover, there isn't enough time to read everything in the tsunami of new
knowledge.

Artificial Intelligence (AI) has allowed the development of AI-aided pipelines
that assist in finding relevant texts for search tasks. A well-established
approach to increase the efficiency of title and abstract screening is
screening prioritization through `active learning <https://asreview.nl/blog/active-learning-explained/>`_: a constant interaction between a
human who labels records and a machine learning model which selects the
most likely relevant record based on a minimum training dataset. It allows
the screening of large amounts of text in an intelligent and time-efficient
manner. Studies have shown the benefits of active learning, `reducing up to 95% <https://www.nature.com/articles/s42256-020-00287-7>`_
of the required screening time.


A `multidisciplinary team <https://asreview.nl/about/>`_ works on the
ASReview-project. The scientifically oriented project contains a collection
of `Github repositories <https://github.com/asreview>`_, `scientific research <https://asreview.nl/research/>`_
projects and `teaching activities <https://asreview.nl/academy/>`_.
The team has developed and validated the open-source software
ASReview LAB which is based on `five fundamental principles <https://asreview.nl/blog/the-zen-of-elas/>`_ : (1) Humans are the Oracle; (2) Code is
open & results are transparent; (3) Decisions are unbiased; (4) The interface shows an
AI is at work; and (5) Users are responsible for importing high quality data.

The goal of ASReview LAB is to help scholars and practitioners to get an
overview of the most relevant records for their work as efficiently as
possible while being transparent in the process. It allows multiple machine
learning models, and ships with exploration and `simulation modes <https://asreview.nl/blog/simulation-mode-class-101/>`_, which are especially
useful for comparing and designing algorithms. Furthermore, it is intended to
be easily extensible, allowing third parties to add modules that enhance the
pipeline with new models, data, and other extensions.


.. figure:: ../../images/FlowChartC.png
   :alt: AI-aided Pipeline

ASReview LAB terminology
------------------------

When you do text screening for a systematic review in ASReview LAB, it can be
useful to know some basic concepts about systematic reviewing and machine
learning to understand. The following overview describes some terms you might
encounter as you use ASReview LAB.

.. glossary::

  Active learning model
    Active learning model is the combination of four elements: a feature
    extraction technique, a classifier, a balance, and a query strategy.

  ASReview
    ASReview stands for *Active learning for Systematic Reviews* or
    *AI-assisted Systematic Reviews*, depending on context. Avoid this
    explanation, only use as tagline.

  ASReview CLI
    ASReview CLI is the command line interface that is developed for advanced
    options or for running simulation studies.

  ASReview LAB
    ASReview LAB is the open-source research software to explore the future
    of AI in systematic reviews.

  ASReview research
    ASReview research is the fundamental and applied research work to
    explore the future of AI in systematic reviewing. The research is
    conducted by the research team, partners, and contributors.

  Data
    Data includes :term:`dataset`, prior knowledge, labels, and
    :term:`notes<note>`.

  Dataset
    Dataset is the collection of :term:`records<record>` that the :term:`user`
    :term:`imports<import>` and :term:`exports<export>`.

  ELAS
    ELAS stands for "Electronic Learning Assistant". It is the name of
    :term:`ASReview` mascot. It is used for storytelling and to increase
    explainability.

  Export
    Export is the action of exporting a :term:`dataset` or a :term:`project`
    from :term:`ASReview LAB`.

  Extension
    Extension is the additional element to the :term:`ASReview LAB`, such as
    the `ASReview visualisation <https://github.com/asreview/asreview-visualization>`__
    extension, or the ASReview CORD-19 extension.

  Import
    Import is the action of importing a :term:`dataset` or a :term:`project`
    into :term:`ASReview LAB`.

  Model configuration
    Model configuration is the action of the :term:`user` to configure the
    :term:`active learning model`.

  Note
    Note is the information added by the :term:`user` in the note field and
    stored in the :term:`project file`. It can be edited on the History page.

  Project
    Project is a project created in :term:`ASReview LAB`.

  Projects dashboard
    Projects dashboard is the landing page containing an overview of all
    :term:`projects<project>` in :term:`ASReview LAB`.

  Project file
    Project file is the ``.asreview`` file containing the :term:`data` and
    :term:`model configuration`. The file is :term:`exported<export>` from
    :term:`ASReview LAB` and can be :term:`imported<import>` back.

  Project mode
    Project mode includes oracle, simulation, and exploration in
    :term:`ASReview LAB`:

    **Oracle** mode is used when a :term:`user` reviews a :term:`dataset`
    systematically with interactive artificial intelligence (AI).

    **Exploration** mode is used when a user explores or demonstrates ASReview
    LAB with a completely labeled dataset. This mode is suitable for teaching
    purposes.

    **Simulation** mode is used when a user simulates a review on a completely
    labeled dataset to see the performance of ASReview LAB.

  Status
    Project status is the stage that a :term:`project` is at in
    :term:`ASReview LAB`.

    **Setup** refers to the fact that the :term:`user` adds project information,
    :term:`imports<import>` the :term:`dataset`, selects the prior knowledge,
    :term:`configures the model<Model configuration>` and initiates the first
    iteration of :term:`model<Active learning model>` training.

    **In Review** refers to the fact that in oracle or exploration mode,
    the user adds labels to :term:`records<record>`, or in simulation mode, the
    simulation is running.

    **Finished** refers to the fact that in oracle or exploration mode, the user
    decides to complete the :term:`reviewing` process or has labeled all the
    records, or in simulation mode, the simulation has been completed.

    **Published** refers to the fact that the user publishes the dataset and
    :term:`project file` in a repository preferably with a Digital Object
    Identifier (DOI).

  Record
    Record is the data point that needs to be labeled. A record can contain
    both information that is used for training the
    :term:`active learning model`, and information that is not used for this
    purpose.

    In the case of systematic reviewing, a record is meta-data for a scientific
    publication. Here, the information that is used for training purposes is
    the text in the title and abstract of the publication. The information that
    is not used for training typically consists of other metadata, for example,
    the authors, journal, or DOI of the publication.

  Reviewing
    Reviewing is the decision-making process on the relevancy of
    :term:`records<record>` (“irrelevant” or “relevant”). It is interchangeable
    with Labeling, Screening, and Classifying.

  User
    The human annotator who labels :term:`records<record>`.

  Screener
    Replacement term when the context is PRISMA-based reviewing.

Privacy
-------

The ASReview LAB software doesn't collect any information about the usage or
user. Great, isn't it?
