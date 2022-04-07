Vocabulary
----------

The ASReview project makes use of standardized terminology for all
communication regarding ASReview and its underlying technology. You can find
an overview of terms and usage in the following table.

+------------------+-----------------------------------------------------------+
| Term             | Usage                                                     |
+==================+===========================================================+
| **Active         | Use to indicate how to select the next record to be       |
| learning         | reviewed by the user. The model consists of several       |
| model**          | elements: a feature extraction technique, a classifier,   |
|                  | a balance and a query strategy.                           |
|                  |                                                           |
| **Model          | Use to refer to the action of the user to configure the   |
| configuration**  | active learning model.                                    |
+------------------+-----------------------------------------------------------+
| **ASReview**     | Means "Active learning for Systematic Reviews" or         |
|                  | "AI-assisted Systematic Reviews", depending on context.   |
|                  | Avoid this explanation, only use as tagline.              |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **ASReview       | Use ASReview project as an encompassing term for all work |
| project**        | that is done by the ASReview team members and ASReview    |
|                  | contributors.                                             |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **ASReview LAB** | Use to indicate the user-friendly interface that has      |
|                  | been developed for researchers to use.                    |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **ASReview CLI** | Use to indicate the command line interface that has       |
|                  | been developed for advanced options or for running        |
|                  | simulations studies.                                      |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Contributors** | Everyone contributing to the ASReview project through     |
|                  | GitHub.                                                   |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Dashboard**    | The landing page containing an overview of all projects   |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Data** versus  | Use dataset to refer to the collection of records that    |
| **Dataset**      | the user imports and exports. Data also include the       |
|                  | prior knowledge, labels, and notes.                       |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **ELAS**         | Electronic Learning Assistant. Name of ASReview mascot.   |
|                  | Use for storytelling and to increase explainability.      |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Extension**    | Use to indicate additional elements to the ASReview       |
|                  | software, such as the ASReview visualisation extension,   |
|                  | or the ASReview CORD-19 extension.                        |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Import**       | Use to describe the action of importing a dataset or a    |
|                  | project into ASReview LAB.                                |
|                  |                                                           |
| **Export**       | Use to describe the action of exporting a dataset or a    |
|                  | project from ASReview LAB.                                |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Mode**         | Use to refer to one of the three project modes in         |
|                  | ASReview LAB: oracle, simulation, and exploration.        |
|                  |                                                           |
|                  | The **Oracle** mode is used when a user performs a        |
|                  | systematic review in interaction with the AI, where the   |
|                  | record tobe screened is the result of the model.          |
|                  |                                                           |
|                  | The **Exploration** mode includes several preloaded       |
|                  | labelled datasets can be used for teaching purposes,      |
|                  | benchmark testing and debugging.                          |
|                  |                                                           |
|                  | The **Simulation** mode is used for running simulations to|
|                  | evaluate the performance of one (or multiple) active      |
|                  | learning models on labelled datasets.                     |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Notes**        | Information added by the user in the note field and       |
|                  | stored in the project file. It can be edited on the       |
|                  | project page **History**.                                 |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Project**      | Use to refer to a project created in ASReview LAB.        |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Project file** | Use to refer to the `.asreview` file containing the data  |
|                  | and model configuration. The file is exported from        |
|                  | ASReview LAB and can be imported back.                    |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Project page** | Use to refer to the displayed page after opening a        |
|                  | project in ASReview LAB. Five pages are available:        |
|                  | Analytics, Review, History, Export, and Details.          | 
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Records**      | The data points that need to be labeled.                  |
|                  | The records can contain both information that is used for |
|                  | training the active learning model, and information that  |
|                  | is not used for this purpose.                             |
|                  |                                                           |
|                  | In the case of systematic reviewing, a record is          |
|                  | meta-data for a scientific publication. Here, the         |
|                  | information that is used for training purposes is the     |
|                  | text in the title and abstract of the publication. The    |
|                  | information that is not used for training typically       |
|                  | consists of other metadata, for example, the authors,     |
|                  | journal, or DOI of the publication.                       |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Reviewing**/   | All terms can be used to indicate the decision-making     |
| Labeling/        | process on the relevancy of records ("irrelevant" or      |
| Screening/       | "relevant").                                              |
| Classifying      |                                                           |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Status**       | Use to refer to the stage that a project is at in         |
|                  | ASReview LAB.                                             |
|                  |                                                           |
|                  | **Setup** refers to the fact that the user adds project   |
|                  | information, imports the dataset, selects the prior       |
|                  | knowledge, configures the model and initiates the first   |
|                  | iteration of model training.                              |
|                  |                                                           |
|                  | **In Review** refers to the fact that in oracle or        |
|                  | exploration mode, the user adds labels to records, or in  |
|                  | simulation mode, the simulation is running.               |
|                  |                                                           |
| Finished         | Finished refers to the fact that in oracle or exploration |
|                  | mode, the user decides to complete the reviewing          |
|                  | process or has labeled all the records, or in simulation  |
|                  | mode, the simulation has been completed.                  |
|                  |                                                           |
| Published        | Published refers to the fact that the user publishes the  |
|                  | dataset and project file in a repository preferably with  |
|                  | a Digital Object Identifier (DOI).                        |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Upgrade**      | When the user opens a project created in a version of     |
|                  | ASReview LAB earlier than 1.0, the project file must be   |
|                  | upgraded to meet new requirements. The upgrade is         |
|                  | irreversible, and an upgraded project can no longer be    |
|                  | imported into earlier versions.                           |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **User**         | The human annotator who labels records.                   |
|                  |                                                           |
| **Screener**     | Replacement term when the context is PRISMA-based         |
|                  | reviewing.                                                |
|                  |                                                           |
+------------------+-----------------------------------------------------------+


