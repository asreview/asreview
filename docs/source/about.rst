Get Started
===========

What is ASReview LAB?
---------------------

ASReview LAB is an open source machine learning tool for screening and
labeling large collection of data in a systematic way. It's sometimes refered
as a tool for title and abstract screening in systematic reviews. ASReview LAB
is one of the products of the ASReview research project.

Artificial Intelligence (AI) and machine learning has allowed the development
of AI-aided pipelines that assist in finding relevant texts for search tasks.
A well-established approach to increase the efficiency of title and abstract
screening is screening prioritization through `Active Learning
<https://asreview.nl/blog/active-learning-explained/>`_: a constant
interaction between a human who labels records and a machine learning model
which selects the most likely relevant record based on a minimum training
dataset. It allows the screening of large amounts of text in an intelligent
and time-efficient manner. ASReview LAB, published in Nature Machine
Intelligence, has shown the benefits of active learning, `reducing up to 95%
<https://www.nature.com/articles/s42256-020-00287-7>`_ of the required
screening time.

Labeling workflow with ASReview
-------------------------------

Start and finish a systematic labeling process with ASReview LAB by following these steps:


1. Create a dataset with potentially relevant records you want to systematically screen. Improve the quality of the data and specify clear reviewing (inclusion/exclusion) criteria)
2. Specify a stopping rule
3. :doc:`start`
4. :doc:`project_create`
5. Upload your data
6. Specify prior knowledge
7. Select the four components of the active learning model
8. Wait for the warming up of the AI (the software is extracting the features and runs the classifier with the prior knowledge)
9. Start :doc:`oracle` until you reach your stopping criteria
10. Export your data and the project file


Quick start
-----------

1. Check if Python 3.7 or later is installed (if not, install Python)

.. code:: bash

  python --version

2. Install ASReview LAB

.. code:: bash

  pip install asreview

3. Open ASReview LAB

.. code:: bash

  asreview lab

4. Click Create to create a project.

5. Select a mode (Oracle, Exploration, Simulation)

6. Name the project, and if you want, add an author name(s) and type a description.

7. **Import a dataset** you want to review, or select a benchmark dataset (only available for **Exploration** and **Simulation**).

8. **Add prior knowledge**. Select at least 1 relevant and 1 irrelevant record to warm up the AI. You can search for a specific record or request random records.

9. Select the four components of the active learning model, or rely on the default settings that have shown fast and excellent performance in many simulation studies.

10. ASReview LAB starts extracting the features and runs the classifier with the prior knowledge.

You’re ready to start labeling your data! All your labeling actions are
automatically saved, so there is no need to click the save button (we don’t
even have one).



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
    from ASReview LAB.

  Extension
    Extension is the additional element to the ASReview LAB, such as
    the `ASReview visualisation <https://github.com/asreview/asreview-visualization>`__
    extension, or the ASReview CORD-19 extension.

  Import
    Import is the action of importing a :term:`dataset` or a :term:`project`
    into ASReview LAB.

  Model configuration
    Model configuration is the action of the :term:`user` to configure the
    :term:`active learning model`.

  Note
    Note is the information added by the :term:`user` in the note field and
    stored in the :term:`project file`. It can be edited on the History page.

  Project
    Project is a project created in ASReview LAB.

  Projects dashboard
    Projects dashboard is the landing page containing an overview of all
    :term:`projects<project>` in ASReview LAB.

  Project file
    Project file is the ``.asreview`` file containing the :term:`data` and
    :term:`model configuration`. The file is :term:`exported<export>` from
    ASReview LAB and can be :term:`imported<import>` back.

  Project mode
    Project mode includes oracle, simulation, and exploration in
    ASReview LAB:

    **Oracle** mode is used when a :term:`user` reviews a :term:`dataset`
    systematically with interactive artificial intelligence (AI).

    **Exploration** mode is used when a user explores or demonstrates ASReview
    LAB with a completely labeled dataset. This mode is suitable for teaching
    purposes.

    **Simulation** mode is used when a user simulates a review on a completely
    labeled dataset to see the performance of ASReview LAB.

  Status
    Project status is the stage that a :term:`project` is at in
    ASReview LAB.

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
