Prepare your Data
=================

To perform an systematic review, ASReview requires a dataset representing
all records (e.g., abstracts of scientific papers) obtained in a systematic
search. To create such a dataset for a systematic review, typically an `online
library search <https://asreview.nl/the-importance-of-abstracts/>`__ is
performed for all studies related to a particular topic.

It is possible to use your own dataset with unlabeled records, partly
labeled records (where the labeled records are used for training a model),
or fully labeled records (used for the Simulation mode). For testing and
demonstrating ASReview (used for the Exploration mode), the software offers
`Demonstration Datasets`_. Also, a plugin with :doc:`Corona related
publications <../plugins/covid19>` is available.

Data Format
-----------

To carry out a systematic review with ASReview on your own dataset, your data
file needs to adhere to a certain format. ASReview accepts the following
formats:

 - **RIS-files** `(wikipedia) <https://en.wikipedia.org/wiki/RIS_(file_format)>`__.
   Extension ``.ris`` or ``.txt``. RIS files are used by digital libraries, like
   IEEE Xplore, Scopus and ScienceDirect. Citation managers Mendeley, RefWorks,
   Zotero, and EndNote support the RIS format as well.

 - **Tabular datasets**. Extensions ``.csv``, ``.xlsx``, and ``.xls``. CSV files should
   be comma separated and UTF-8 encoded.

For tabular data files, the software accepts a set of predetermined column names:

+----------+---------------------------------------------------------------------------------------------------------+-----------+
| Name     | Column names                                                                                            | Mandatory |
+==========+=========================================================================================================+===========+
| title    | title, primary_title                                                                                    | yes\*     |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| abstract | abstract, abstract note                                                                                 | yes\*     |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| keywords | keywords                                                                                                | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| authors  | authors, author names, first_authors                                                                    | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| doi      | doi                                                                                                     | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| included | final_included, label, label_included, included_label, included_final, included, included_flag, include | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+

\* Either a title or an abstract is mandatory.


Metadata
--------

Each entry in the dataset should hold metadata on a paper. Mandatory metadata
are ``title`` or ``abstract``. If both title and abstract are available the
text is combined and used for training the model. If ``keywords`` and/or
``author`` are available it can be used for searching prior knowledge. Note
the information is not shown during the screening phase and is also not used
for training the model, but the information is available via the API. If
``DOI`` is available it will be displayed during the screening phase as a
clickable hyperlink to the full text document. Note by using ASReview you do
not automatically have access to full-text and if you do not have access you
might want to read this `blog post <https://asreview.nl/tools-that-work-well-with-asreview-google-scholar-button/>`__.

When using the :doc:`ASReview command line interface for simulation
<../API/cli/>`, an additional binary variable to indicate labeling decisions
(``0`` = irrelevant, ``1`` = relevant) is required for ALL records. In
ASReview LAB, if labels are available for a part of the dataset (i.e., :doc:`partly
labeled data <../features/pre_screening>`), the labels will be automatically detected and used for prior
knowledge.

You can explore a previously labeled dataset in ASReview LAB by adding an
extra column called ‘debug_label’, indicating the relevant and irrelevant
records with ones and zeroes. The relevant records will show up green during
screening.


Compatibility
-------------

Citation Managers
~~~~~~~~~~~~~~~~~

The following table provides an overview of export files from citation
managers  which are accepted by ASReview.

+-----------------+---------------+----------------+--------------+--------------+
|                 | **.ris**      | **.tsv**       | **.csv**     | **.xlsx**    |
+-----------------+---------------+----------------+--------------+--------------+
| **Endnote**     | Supported     | Not supported  |              |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Excel**       |               |                | Supported\*  |  Supported   |
|                 |               |                |              |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Mendeley**    | Supported     |                |              |              |
|                 |               |                |              |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Refworks**    | Supported     | Not supported  |              |              |
|                 |               |                |              |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Zotero**      | Supported     |                | Supported    |              |
|                 |               |                |              |              |
+-----------------+---------------+----------------+--------------+--------------+

- Supported: The data can be exported from the citation manager and imported in ASReview using this extension.
- Not supported: The exported format can not be imported in ASReview.
- (empty): The data cannot be exported from the citation manager in this format.

\* Only comma seperated files are supported. Semicolon seperated files are not supported.

Search Engines
~~~~~~~~~~~~~~

When using search engines, it is often possible to store the articles of
interest in a list or folder within the search engine itself. Thereafter, you
can choose from different ways to export the list/folder. When you have the
option to select parts of the citation to be exported, choose the option which
will provide the most information.

The export files of the following search engines have been tested for their
acceptance in ASReview:

+-----------------+---------------+----------------+---------------+---------------+
|                 | **.ris**      | **.tsv**       | **.csv**      | **.xlsx**     |
|                 |               |                |               |               |
+-----------------+---------------+----------------+---------------+---------------+
|**CINHAL**       | Not supported |                |Not supported  |               |
|**(EBSCO)**      |               |                |               |               |
+-----------------+---------------+----------------+---------------+---------------+
|**Cochrane**     | Supported     |                | Supported     |               |
+-----------------+---------------+----------------+---------------+---------------+
| **Embase**      | Supported     |                | Supported     | Supported     |
+-----------------+---------------+----------------+---------------+---------------+
|**Eric (Ovid)**  | Not supported |                |               |Not supported  |
+-----------------+---------------+----------------+---------------+---------------+
|**Psychinfo**    | Not supported |                |               |Not supported  |
|**(Ovid)**       |               |                |               |               |
+-----------------+---------------+----------------+---------------+---------------+
| **Pubmed**      | Not supported |                |Not supported  |               |
+-----------------+---------------+----------------+---------------+---------------+
| **Scopus**      | Supported     |                |Supported      |               |
+-----------------+---------------+----------------+---------------+---------------+
|**Web of**       | Not supported |Not supported   |               |               |
|**Science**      |               |                |               |               |
+-----------------+---------------+----------------+---------------+---------------+

- Supported: The data can be exported from the search engine and imported in ASReview using this extension.
- Not supported: The exported data can not be imported in ASReview using this extension.
- (empty): The data cannot be exported from the search engine using this extension.


If the export of your search engine is not accepted in ASReview, you can also
try the following: import the search engine file first into one of the
citation managers mentioned in the previous part, and export it again into a
format that is accepted by ASReview.

Systematic Review Software
~~~~~~~~~~~~~~~~~~~~~~~~~~

There are several software packages available for systematic reviewing. Some
of them use machine learning, while other focus on screening and management.
The overview below shows an overview of alternative software programs and the
compatibility with ASReview.

+-----------------+---------------+----------------+--------------+--------------+
|                 | **.ris**      | **.tsv**       | **.csv**     | **.xlsx**    |
|                 |               |                |              |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Abstrackr**   | Supported     |                | Supported    |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Covidence**\* | Supported     |                | Supported    |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Distiller**   |Not supported  |                | Supported\** | Supported\** |
+-----------------+---------------+----------------+--------------+--------------+
|**EPPI-reviewer**| Supported     |                |              |Not supported |
+-----------------+---------------+----------------+--------------+--------------+
| **Rayyan**      | Supported     |                | Supported    |              |
+-----------------+---------------+----------------+--------------+--------------+
|**Robotreviewer**|               |                |              |              |
|\***		  |    		  |                |              |              |
+-----------------+---------------+----------------+--------------+--------------+

- Supported: The data can be exported from the software and imported in ASReview using this extension.
- Not supported: The exported data can not be imported in ASReview using this extension.
- (empty): The data cannot be exported from the software using this extension.

\* When using Covidence it is possible to export articles in .ris formats for different citation managers,
such as Endnote, Mendeley, Refworks and Zotero. All of these are compatible with ASReview.

\** When exporting from Distiller set the ``sort references by`` to ``Authors``. Then the data can be
imported in ASReview.

\*** Robotreviewer does not provide exports suitable for asreview, since it supports evidence synthesis.


.. _demonstration-datasets:

Demonstration Datasets
----------------------

The ASReview software contains 3 datasets that can be used to :doc:`explore <../lab/exploration>` the
software and algorithms. The built-in datasets are PRISMA based reviews on
various research topics. Each paper in this systematic review is labeled relevant or
irrelevant. This information can be used to simulate the performance of ASReview.
The datasets are available in the front-end in step 2 and in the simulation mode.

Van de Schoot (PTSD)
~~~~~~~~~~~~~~~~~~~~

A dataset on 5782 papers on posttraumatic stress disorder. Of these papers, 38
were included in the systematic review.

    "We performed a systematic search to identify longitudinal studies that applied LGMM,
    latent growth curve analysis, or hierarchical cluster analysis on symptoms of
    posttraumatic stress assessed after trauma exposure."

**Bayesian PTSD-Trajectory Analysis with Informed Priors Based on a Systematic Literature**
**Search and Expert Elicitation**
Rens van de Schoot, Marit Sijbrandij, Sarah Depaoli, Sonja D. Winter, Miranda Olff
& Nancy E. van Loey
https://doi.org/10.1080/00273171.2017.1412293

Dataset publication: https://osf.io/h5k2q/

Name (for the simulation mode): ``example_ptsd``

Hall (Fault prediction - software)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A dataset on 8911 papers on fault prediction performance in software
engineering.  Of these papers, 104 were included in the systematic review.

The dataset results from

**How to Read Less: Better Machine Assisted Reading Methods for Systematic Literature Reviews.**
Yu, Zhe, Kraft, Nicholas, Menzies, Tim. (2016).  `arXiv:1612.03224v1 <https://www.researchgate.net/publication/311586326_How_to_Read_Less_Better_Machine_Assisted_Reading_Methods_for_Systematic_Literature_Reviews>`_

The original study can be be found here:

**A systematic literature review on fault prediction performance in software engineering**
T. Hall, S. Beecham, D. Bowes, D. Gray, S. Counsell, in IEEE Transactions on Software
Engineering, vol. 38, no. 6, pp. 1276-1304, Nov.-Dec. 2012. https://doi.org/10.1109/TSE.2011.103


Dataset publication https://zenodo.org/record/1162952.

Name (for the simulation mode): ``example_hall``


Cohen (ACE Inhibitors)
~~~~~~~~~~~~~~~~~~~~~~

A dataset from a project set up to test the performance of automated review
systems such as the ASReview project. The project includes several datasets
from the medical sciences. The dataset implemented in ASReview is the
``ACEInhibitors`` dataset. Of the 2544 entries in the dataset, 41 were
included in the systematic review.

**Reducing Workload in Systematic Review Preparation Using Automated Citation Classification**
A.M. Cohen, MD, MS, W.R. Hersh, MD, K. Peterson, MS, and Po-Yin Yen, MS. https://doi.org/10.1197/jamia.M1929

Name (for the simulation mode): ``example_cohen``

