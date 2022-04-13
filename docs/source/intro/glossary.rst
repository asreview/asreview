Glossary
--------

ASReview LAB makes use of standardized terminology for all communication
regarding ASReview LAB and its underlying technology.

.. glossary::

  Active learning model
    Active learning model is used to indicate how to select the next
    :term:`record` to be reviewed by the :term:`user`. The model consists of
    several elements: a feature extraction technique, a classifier, a balance
    and a query strategy.

  ASReview
    ASReview stands for *Active learning for Systematic Reviews* or
    *AI-assisted Systematic Reviews*, depending on context. Avoid this
    explanation, only use as tagline.

  ASReview CLI
    ASReview CLI is the command line interface that is developed for advanced
    options or for running simulation studies.

  ASReview LAB
    ASReview LAB is the graphical user interface.

  ASReview project
    ASReview project is an encompassing term for all work that is done by the
    ASReview team members and ASReview :term:`contributors<contributor>`.

  Contributor
    Contributor is anyone who contributes to the :term:`ASReview project`
    through GitHub.

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
    the ASReview visualisation extension, or the ASReview CORD-19 extension.

  Import
    Import is the action of importing a :term:`dataset` or a :term:`project`
    into :term:`ASReview LAB`.

  Model configuration
    Model configuration is the action of the :term:`user` to configure the
    :term:`active learning model`.

  Note
    Note is the information added by the :term:`user` in the note field and
    stored in the :term:`project file`. It can be edited on the
    :term:`project page` History.

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

  Project page
    Project page is the displayed page after opening a :term:`project` in
    :term:`ASReview LAB`. Five pages are available: Analytics, Review, History,
    Export, and Details.

  Project status
    Project status is the stage that a :term:`project` is at in
    :term:`ASReview LAB`.

    **Setup** refers to the fact that the :term:`user` adds project information,
    :term:`imports<import>` the :term:`dataset`, selects the prior knowledge,
    :term:`configures the model<Model configuration>` and initiates the first
    iteration of :term:`model<Active learning model>` training.

    **In Review** refers to the fact that in oracle or exploration :term:`mode`,
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

  Upgrade
    Upgrade means when the :term:`user` opens a :term:`project` created in a
    version of :term:`ASReview LAB` earlier than 1.0, the :term:`project file`
    must be upgraded to meet new requirements. The upgrade is irreversible, and
    an upgraded project can no longer be :term:`imported<import>` into earlier
    versions.

  User
    The human annotator who labels :term:`records<record>`.

  Screener
    Replacement term when the context is PRISMA-based reviewing.
