Introduction
============

ASReview LAB is an open-source machine learning tool designed to streamline the
systematic screening and labeling of large textual datasets. It is widely used
for tasks such as title and abstract screening in systematic reviews or
meta-analyses, but its applications extend to any scenario requiring systematic
text screening.

With ASReview LAB, you can:

.. list-table::
  :header-rows: 1

  * - Feature
    - Description
  * - **Review**
    - Interactively screen textual data with an active learning model, where the user acts as the 'oracle' to make labeling decisions. You can also validate labels provided by other screeners or AI models.
  * - **Simulate**
    - Assess the performance of active learning models using fully labeled datasets.

ASReview LAB is a flagship product of `Utrecht University's AI Lab "AI-aided
Knowledge Discovery" <https://www.uu.nl/en/research/ai-labs/disc-ai-lab>`_. It
has fostered a vibrant global community of researchers, users, and developers.

.. youtube:: k-a2SCq-LtA

What is active learning?
------------------------

Artificial Intelligence (AI) and machine learning have allowed the development
of AI-aided pipelines that assist in finding relevant texts for search tasks. A
well-established approach to increasing the efficiency of screening large
amounts of textual data is screening prioritization through `Active Learning
<https://asreview.ai/blog/active-learning-explained/>`_: a constant interaction
between a human who labels records and a machine learning model which selects
the most likely relevant record based on a minimum training dataset. The active
learning cycle is repeated until the annotator is sufficiently confident they
have seen all relevant records. Thus, the machine learning model is responsible
for ranking the records, and the human provides the labels. This is called
`Researcher-In-The-Loop (RITL)
<https://asreview.ai/blog/active-learning-explained/>`_.

It allows the screening of large amounts of text in an intelligent and
time-efficient manner. ASReview LAB, published in Nature Machine Intelligence,
has shown the benefits of active learning, `reducing up to 95%
<https://www.nature.com/articles/s42256-020-00287-7>`_ of the required
screening time.

Products
--------

ASReview offers the following tools and resources:

1. **ASReview LAB**: An open-source, browser-based software for AI-aided
   systematic screening of textual data, such as systematic reviews or
   meta-analyses. It supports various feature extractors and classifiers. Learn
   more in the `Nature Machine Intelligence publication
   <https://www.nature.com/articles/s42256-020-00287-7>`__.

2. **ASReview LAB Server**: A self-hosted solution extending ASReview LAB with
   features like authentication and AI-aided screening with multiple reviewers.

3. **Datasets**: Access a collection of datasets for research purposes,
   including the Synergy dataset available on the `SYNERGY repository
   <https://github.com/asreview/synergy-dataset>`__.

4. **Extensions**: Extend ASReview LAB with new models, subcommands, and
   datasets. Officially supported extensions include:

   - `ASReview-dory <https://github.com/asreview/asreview-dory>`__: Advanced
     models and components for systematic review screening.
   - `ASReview-insights <https://github.com/asreview/asreview-insights>`__:
     Advanced insights and performance metrics for simulations.
   - `ASReview-makita <https://github.com/asreview/asreview-makita>`__: Workflow
     generator for simulation studies.

   For community-maintained extensions, see the `List of extensions
   <https://github.com/asreview/asreview/discussions/1140>`__. To develop your
   own extension, refer to :doc:`../technical/extensions`.


General workflow with ASReview
------------------------------

Start and finish a systematic labeling process with ASReview LAB by following
these steps:

1. :doc:`data`. Your dataset includes relevant records that you aim to identify
   systematically.
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
    An active learning model is a machine learning model that is used to
    prioritize the records in the dataset. The model interactively learns from
    the labels provided by the :term:`user` and improves its performance over
    time.

  CLI
    The CLI is the Command Line Interface that is used to start ASReview LAB and
    perform various other tasks.

  Dataset
    A dataset is the collection of records (:term:`record`) that the :term:`user` reviews.

  ELAS
    ELAS stands for "Electronic Learning Assistant". It is the name of the
    mascot of ASReview and used for storytelling and to increase explainability.

  Extension
    An extension is an additional element to the ASReview LAB, such as the
    `ASReview Dory <https://github.com/asreview/asreview-dory>`__ extension.

  Note
    A note is the information added by the :term:`user` in the note field and
    stored in the :term:`project`. It can be edited on the History page.

  Project
    A project is a project created in ASReview LAB and can be a "review" or a
    "simulation". A project contains the :term:`dataset`, :term:`Active learning
    model`, and the :term:`user` labels. A project can be exported to an ASReview file with extension
    ``.asreview``. The project can be imported back into ASReview LAB.

  Status
    The project status is the stage that a :term:`project` is at in ASReview
    LAB. Projects can be in one of the following statuses:

    - In review: The project is in the process of being labeled by the user.
    - Finished: The project has been completed by the user or the simulation
      has been completed.

  Simulation
    A simulation is a project that is used to test the performance of the
    :term:`Active learning model` on a fully labeled dataset. The simulation
    allows the user to evaluate the performance of the model and compare it to
    other models.

  Record
    A record is the piece of text that needs to be labeled. It usually consists
    of a title and an abstract. The record is the unit of analysis in ASReview
    LAB. For scholars, a record is a title and abstract of a paper. For other
    domains, it can be any piece of text that needs to be labeled.

  Review
    Reviewing is the decision-making process on the relevance of
    :term:`record` ("relevant", "irrelevant"). The term reviewing is
    interchangeable with Labeling, Screening, and Classifying.

  User
    The human annotator or screener is the person who labels
    :term:`record`.


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
