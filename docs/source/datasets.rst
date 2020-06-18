Data sets
=========
To perform an automated systematic review, ASReview requires a data set representing
all papers obtained in a systematic search. To create such a data set for a systematic
review, typically an online library search is performed for all studies related to a
particular topic.

Each entry in the data set should hold metadata on a paper. 
Mandatory metadata are ``title`` and ``abstract``.
Other metadata such as ``id``, ``author``, ``date``, and ``keywords`` are optional.
When using ASReview in simulation mode, an additional binary variable to indicate
labeling decisions is required, called ``included`` or ``label_included``. 
All entries in the data set need to be screened, with the goal to select all relevant papers. 

For testing and demonstrating ASReview, the software offers
`three built-in data sets <#built-in-demonstration-data-sets>`__
It is also possible to perform an automated systematic review on
`your own data set <#using-your-own-data>`__.


Using your own data
-------------------

To carry out an automated systematic review on your own data set, your data file needs 
to adhere to a certain format. ASReview accepts the following formats: 

 - `Research Information Systems (RIS) <https://en.wikipedia.org/wiki/RIS_(file_format)>`_. 
   Extension ``.ris``. RIS files are used by digital libraries, like IEEE Xplore, Scopus 
   and ScienceDirect. Citation managers Mendeley, RefWorks, Zotero, and EndNote support 
   the RIS format as well. 
 - **Tabular data sets**. Extensions ``.csv``, ``.xlsx``, and ``.xls``. CSV files should 
   be comma separated and UTF-8 encoded. For CSV files, the software accepts a set of 
   predetermined labels in line with the ones used in RIS files. 

Metadata
~~~~~~~~
Each entry in the data set should hold metadata on a paper. Mandatory metadata are title and abstract. Other metadata such as id, author, date, and keywords are optional. When using ASReview in simulation mode, an additional binary variable to indicate labeling decisions is required, called included or label_included. All entries in the data set need to be screened, with the goal to select all relevant papers.

+----------+---------------------------------------------------------------------------------------------------------+-----------+
| Name     | CSV names                                                                                               | Mandatory |
+==========+=========================================================================================================+===========+
| title    | title, primary_title                                                                                    | yes*      |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| abstract | abstract, abstract note                                                                                 | yes*      |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| keywords | keywords                                                                                                | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| authors  | authors, author names, first_authors                                                                    | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| doi      | doi                                                                                                     | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+
| included | final_included, label, label_included, included_label, included_final, included, included_flag, include | no        |
+----------+---------------------------------------------------------------------------------------------------------+-----------+

*Either a title or an abstract is mandatory.
 
Export tools
------------

Citation managers
~~~~~~~~~~~~~~~~~

The following table provides an overview of export files from citation managers  which are accepted by ASReview. 

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
- Empty: The data cannot be exported from the citation manager in this format.

Search engines
~~~~~~~~~~~~~~
When using search engines, it is often possible to store the articles of interest in a list or folder within the search engine itself. Thereafter, you can choose from different ways to export the list/folder. When you have the option to select parts of the citation to be exported, choose the option which will provide the most information. 

The export files of the following search engines have been tested for their acceptance in ASReview:

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
- Empty: The data cannot be exported from the search engine using this extension.


If the export of your search engine is not accepted in ASReview, you can also try the following: import the search engine file first into one of the citation managers mentioned in the previous part, and export it again into a format that is accepted by ASReview.

About systematic review software
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
It is also possible to import a data set from Rayyan. However, only the 
``.csv`` extension is compatible with ASReview.
 

+-----------------+---------------+----------------+--------------+--------------+ 
|                 | **.ris**      | **.tsv**       | **.csv**     | **.xlsx**    |
|                 |               |                |              |              |
+-----------------+---------------+----------------+--------------+--------------+
| **Rayyan**      | Not supported |                | Supported    |              |
+-----------------+---------------+----------------+--------------+--------------+

Built-in demonstration data sets
--------------------------------
The built-in data sets are PRISMA based reviews on various research topics. 
All papers selected in the original systematic review are indicated.
This information can be used to simulate the performance of ASReview. 

PTSD-data
~~~~~~~~~~~~~
A data set on 5782 papers on posttraumatic stress disorder. Of these papers, 38 were
included in the systematic review.

    "We performed a systematic search to identify longitudinal studies that applied LGMM,
    latent growth curve analysis, or hierarchical cluster analysis on symptoms of
    posttraumatic stress assessed after trauma exposure."

**Bayesian PTSD-Trajectory Analysis with Informed Priors Based on a Systematic Literature**
**Search and Expert Elicitation**
Rens van de Schoot, Marit Sijbrandij, Sarah Depaoli, Sonja D. Winter, Miranda Olff
& Nancy E. van Loey
https://doi.org/10.1080/00273171.2017.1412293

Data set publication: https://osf.io/h5k2q/

Name: ``example_ptsd``

Hall
~~~~
A data set on 8911 papers on fault prediction performance in software engineering. 
Of these papers, 104 were included in the systematic review. 

The data set results from

**How to Read Less: Better Machine Assisted Reading Methods for Systematic Literature Reviews.**
Yu, Zhe, Kraft, Nicholas, Menzies, Tim. (2016).  `arXiv:1612.03224v1 <https://www.researchgate.net/publication/311586326_How_to_Read_Less_Better_Machine_Assisted_Reading_Methods_for_Systematic_Literature_Reviews>`_

The original study can be be found here:

**A systematic literature review on fault prediction performance in software engineering**
T. Hall, S. Beecham, D. Bowes, D. Gray, S. Counsell, in IEEE Transactions on Software
Engineering, vol. 38, no. 6, pp. 1276-1304, Nov.-Dec. 2012. https://doi.org/10.1109/TSE.2011.103


Data set publication https://zenodo.org/record/1162952#.XiBgMi2ZNQK 

Name: ``example_hall``


Cohen
~~~~~
Data set from a project set up to test the performance of automated review systems such as
the ASReview project. The project includes several data sets from the medical sciences. 
The data set implemented in ASReview is the ``ACEInhibitors`` data set. 
Of the 2544 entries in the data set, 41 were included in the systematic review. 

**Reducing Workload in Systematic Review Preparation Using Automated Citation Classification**
A.M. Cohen, MD, MS, W.R. Hersh, MD, K. Peterson, MS, and Po-Yin Yen, MS. https://doi.org/10.1197/jamia.M1929

Name: ``example_cohen``

