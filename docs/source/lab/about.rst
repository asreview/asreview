Get Started
===========

What is ASReview LAB?
---------------------

ASReview LAB is an open-source machine learning tool designed to streamline the
systematic screening and labeling of large textual datasets. It is widely used
for tasks such as title and abstract screening in systematic reviews or
meta-analyses, but its applications extend to any scenario requiring systematic
text screening.

With ASReview LAB, you can:

+----------------+------------------------------------------------------------------------------------------------------------------+
|                | Description                                                                                                      |
+================+==================================================================================================================+
| **Review**     | Interactively screen textual data with an active learning model, where the user acts as the 'oracle' to make     |
|                | labeling decisions. You can also validate labels provided by other screeners or AI models.                       |
+----------------+------------------------------------------------------------------------------------------------------------------+
| **Simulate**   | Assess the performance of active learning models using fully labeled datasets.                                   |
+----------------+------------------------------------------------------------------------------------------------------------------+

ASReview LAB is a flagship product of Utrecht University's AI Lab "AI-aided
Knowledge Discovery." It has fostered a vibrant global community of researchers,
users, and developers.

.. youtube:: k-a2SCq-LtA

What is active learning?
------------------------

Artificial Intelligence (AI) and machine learning have allowed the development
of AI-aided pipelines that assist in finding relevant texts for search tasks.
A well-established approach to increasing the efficiency
of screening large amounts of textual data is screening prioritization through
`Active Learning <https://asreview.ai/blog/active-learning-explained/>`_: a constant
interaction between a human who labels records and a machine learning model
which selects the most likely relevant record based on a minimum training
dataset. The active learning cycle is repeated until the annotator is sufficiently
confident they have seen all relevant records. Thus, the machine learning model is
responsible for ranking the records, and the human provides the labels. This is called
`Researcher-In-The-Loop (RITL) <https://asreview.ai/blog/active-learning-explained/>`_.

It allows the screening of large amounts of text in an intelligent
and time-efficient manner. ASReview LAB, published in Nature Machine
Intelligence, has shown the benefits of active learning, `reducing up to 95%
<https://www.nature.com/articles/s42256-020-00287-7>`_ of the required
screening time.


General workflow with ASReview
------------------------------

Start and finish a systematic labeling process with ASReview LAB by following
these steps:

1. Create or get a (large) dataset with (sparse) relevant records you want to
   find in a systematic way.
2. :doc:`start`
3. :doc:`project_create`
4. :ref:`Select Prior Knowledge <lab/project_create:Prior Knowledge>` if
   available.
5. Start :doc:`screening`
6. Specify a `stopping criterion
   <https://github.com/asreview/asreview/discussions/557>`__. The dashboard can
   be used for this.
7. At any time, you can export the resulting :term:`dataset` with the labeling
   decisions or the entire :term:`project`.


ASReview LAB terminology
------------------------

When you do text screening for a systematic review in ASReview LAB, it can be
useful to know some basic concepts about systematic reviewing and machine
learning. The following overview describes some terms you might
encounter as you use ASReview LAB.

.. glossary::

  Active learning model
    An active learning model is the combination of four elements: a feature
    extraction technique, a classifier, a balance, and a query strategy.

  ASReview
    ASReview stands for *Active learning for Systematic Reviews* or *AI-assisted
    Systematic Reviews*, depending on context. Avoid this explanation, only use
    as a tagline.

  CLI
    The CLI is the command line interface that is developed for advanced options
    or for running simulation studies.

  Data
    Data includes :term:`dataset`, prior knowledge, labels, and
    :term:`notes<note>`.

  Dataset
    A dataset is the collection of :term:`records<record>` that the :term:`user`
    :term:`imports<import>` and :term:`exports<export>`.

  ELAS
    ELAS stands for "Electronic Learning Assistant". It is the name of
    :term:`ASReview` mascot. It is used for storytelling and to increase
    explainability.

  Export
    Export is the action of exporting a :term:`dataset` or a :term:`project`
    from ASReview LAB.

  Extension
    An extension is an additional element to the ASReview LAB, such as the
    `ASReview Datatools <https://github.com/asreview/asreview-datatools>`__
    extension.

  Model configuration
    Model configuration is the action of the :term:`user` to configure the
    :term:`active learning model`.

  Note
    A note is the information added by the :term:`user` in the note field and
    stored in the :term:`project file`. It can be edited on the History page.

  Project
    A project is a project created in ASReview LAB.

  Projects dashboard
    The project dashboard is the landing page containing an overview of all
    :term:`projects<project>` in ASReview LAB.

  Project file
    The project file is the ``.asreview`` file containing the :term:`data` and
    :term:`model configuration`. The file is :term:`exported<export>` from
    ASReview LAB and can be :term:`imported<import>` back.

  Status
    The project status is the stage that a :term:`project` is at in ASReview
    LAB.

    **In Review** refers to the fact that in oracle, the user adds labels to
    :term:`records<record>`, or in simulation mode, the simulation is running.

    **Finished** refers to the fact that in oracle, the user decides to complete
    the :term:`reviewing` process or has labeled all the records, or in
    simulation mode, the simulation has been completed.

  Simulation
    Simulation is the process of running a simulation study in ASReview LAB. The
    simulation study is used to assess the performance of an active learning
    model on a fully labeled dataset.

  Record
    A record is the data point that needs to be labeled. A record can contain
    both information that is used for training the :term:`active learning
    model`, and information that is not used for this purpose.

    In the case of systematic reviewing, a record is meta-data for a scientific
    publication. Here, the information that is used for training purposes is the
    text in the title and abstract of the publication. The information that is
    not used for training typically consists of other metadata, for example, the
    authors, journal, or DOI of the publication.

  Reviewing
    Reviewing is the decision-making process on the relevance of
    :term:`records<record>` (“irrelevant” or “relevant”). It is interchangeable
    with Labeling, Screening, and Classifying.

  User
    The human annotator is the person who labels :term:`records<record>`.

  Screener
    Replacement term when the context is PRISMA-based reviewing.


Key principles
--------------

ASReview LAB is built on a foundation of core principles that ensure its
effectiveness, transparency, and usability. These principles guide the design
and functionality of the tool, empowering users to conduct systematic reviews
with confidence and efficiency. The five fundamental principles are:

1. Humans are the oracle;
2. Code is open and results are transparent;
3. Decisions are unbiased;
4. The interface clearly communicates the presence of AI;
5. Users are responsible for importing high-quality data.


Privacy
-------

The ASReview LAB software doesn't collect any information about its usage or
its user. Great, isn't it!
