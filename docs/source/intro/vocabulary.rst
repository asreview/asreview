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
| **Data** versus  | Use dataset to refer to the collection of the records a   |
| **Dataset**      | user imports and exports. Data also include the           |
|                  | prior knowledge, labels, and notes.                       |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **ELAS**         | Our Electronic Learning ASsistent. Name of our mascot.    |
|                  | Use for storytelling and to increase explainability.      |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Extension**    | Use to indicate additional elements to the ASReview       |
|                  | software, such as the ASReview visualisation extension,   |
|                  | or the ASReview CORD-19 extension.                        |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Import**       | Use to describe the proces of importing a dataset in      |
|                  | the software (instead of uploading).                      |
|                  |                                                           |
| **Export**       | Use to describe the proces of exporting  data from        |
|                  | the software (instead of downloading)                     |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Mode**         | Use to refer to one of the three modi available in the    |
|                  | software: oracle, simulation and exploration mode.        |
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
|                  | stored in a separate column in the output data.           |
|                  | It can be changed in the history panel.                   |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Project**      | Use to refer to a project available in the front-end      |
|                  | containing the data the project and model settings, prior |
|                  | knowlede, the labels, notes and all historical decissions.|
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Project file** | Use to refer to the `.asreview` file containing the data  |
|                  | the project and model settings, the labels and all        |
|                  | the information needed to reproduce the output.           |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Project page** | Within a project, there are multiple project pages        |
|                  | available: Analytics, Review, History, Export, Details    |
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
| **Status**       | Use to describe the different stages in the software.     |
|                  |                                                           |
|                  | In the **Set-up** the user adds project information,      |
|                  | imports the dataset, selects priors, knowledge,           |
|                  | configures the model. It also includes the 1st            |
|                  | iteration of model.                                       |
|                  |                                                           |
|                  | In the **In Review** (or running) part of the process the |
|                  | user adds labels or notes (in Oracle Mode), or where the  |
|                  | labels are determined by the software (in Simulation Mode)|
|                  |                                                           |
| Finished/        | Whenever the user decides that the reviewing process      |
| stopped          | has been completed or if all records are labeled by the   |
|                  | human (in Oracle mode) or by the software (in Simulation  |
|                  | mode.                                                     |
|                  |                                                           |
| Published        | Whenever the data and project file are pubished in a      |
|                  | repository (preferably with a Digital Object Identifier). |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **Upgrade**      | When a user imports a project created before v 1.0        |
|                  | the project files must be updated to meet the new 	       |
|                  | requirements. This process is irreversible,               |
|                  | and an upgraded project can no longer be imported into    |
|                  | older versions.                                           |
|                  |                                                           |
+------------------+-----------------------------------------------------------+
| **User**         | The human annotator who labels records.                   |
|                  |                                                           |
| **Screener**     | Replacement term when context is PRISMA-based reviewing.  |
|                  |                                                           |
+------------------+-----------------------------------------------------------+


