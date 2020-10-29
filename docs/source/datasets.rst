Datasets
========

To perform an systematic review, ASReview LAB requires a dataset representing
all records (e.g., abstracs of scientific papers) obtained in a systematic search. To create such
a dataset for a systematic review, typically an `online library search <https://asreview.nl/the-importance-of-abstracts/>` is
performed for all studies related to a particular topic.

It is possible to use your own dataset with unlabelled records, 
partly labelled records (where the labelled records are used for training a model), 
or fully labelled records (used for the Simulation mode).
For testing and demonstrating ASReview (used for the Exploration mode), the software offers
`three built-in datasets <https://asreview.readthedocs.io/en/latest/datasets.html#demonstration-datasets>`__
Also, a plugin with `Corona related publications<https://asreview.readthedocs.io/en/latest/covid-19.html>` is available. 

Data format
-----------

To carry out an automated systematic review on your own dataset, your data file needs
to adhere to a certain format. ASReview accepts the following formats:

 - **RIS-files**.  Extension ``.ris`` or ``.txt``. RIS files are used by digital libraries, like IEEE Xplore, Scopus
   and ScienceDirect. Citation managers Mendeley, RefWorks, Zotero, and EndNote support
   the RIS format as well.
 - **Tabular datasets**. Extensions ``.csv``, ``.xlsx``, and ``.xls``. CSV files should
   be comma separated and UTF-8 encoded. For CSV files, the software accepts a set of predetermined labels:

+----------+---------------------------------------------------------------------------------------------------------+-----------+
| Name     | CSV names                                                                                               | Mandatory |
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
are ``title`` or ``abstract``. If both title and abstract are available the text is combined and used for training the model. 
If ``keywords`` and/or ``author`` are available it can be used for searching prior knowledge. Note
the information is not shown during the screening phase and is also not used for training the model, 
but the information is available via the API.
If ``DOI`` is available it will be displayed during the screening phase as a clickable hyperlink to the full text document. 
Note by using ASReview you do not automatically have access to full-text and if you do not have access 
you might want to read this `blog post <https://asreview.nl/tools-that-work-well-with-asreview-google-scholar-button/>`. 

When using the ASReview command line interface (link) for simulation, an additional binary
variable to indicate labeling decisions (``0`` = irrelevant, ``1`` = relevant) is required for ALL records.
If labels are available for a part of the dataset (i.e., partly labelled data), 
the labels will be automatically detected and used for prior knowledge. 


Compatibility
-------------

Citation managers
~~~~~~~~~~~~~~~~~

The following table provides an overview of export files from citation
managers  which are accepted by ASReview.

+-----------------+---------------+----------------+--------------+--------------+
|                 | **.ris**      | **.tsv**       | **.csv**     | **.xlsx**    |
+-----------------+---------------+----------------+--------------+--------------+
| **Endnote**     | Supported     | Not supported  |              |              |
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

Search engines
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

Systematic review software
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

Demonstration datasets
----------------------

The ASReview software contains 3 datasets that can be used to test the
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


Dataset publication https://zenodo.org/record/1162952#.XiBgMi2ZNQK

Name (for the simulation mode): ``example_hall``


Cohen (ACE Inhibitors)
~~~~~~~~~~~~~~~~~~~~~~

dataset from a project set up to test the performance of automated review systems such as
the ASReview project. The project includes several datasets from the medical sciences.
The dataset implemented in ASReview is the ``ACEInhibitors`` dataset.
Of the 2544 entries in the dataset, 41 were included in the systematic review.

**Reducing Workload in Systematic Review Preparation Using Automated Citation Classification**
A.M. Cohen, MD, MS, W.R. Hersh, MD, K. Peterson, MS, and Po-Yin Yen, MS. https://doi.org/10.1197/jamia.M1929

Name (for the simulation mode): ``example_cohen``

