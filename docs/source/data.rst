Prepare your Data
=================

ASReview LAB requires a dataset containing a set of textual records (e.g.,
titles and abstracts of scientific papers, newspaper articles, or policy
reports) obtained via a systematic search. The goal is to review all records
systematically using predetermined inclusion and exclusion criteria. Also, it
should be expected that only a fraction of the records in the dataset are
relevant.

It is possible to use a fully unlabeled dataset for the Oracle Mode, a partly
labeled dataset where the labeled records are used to train a model for the
unlabeled records (also for the Oracle Mode), or a fully labeled one dataset
used for the Exploration and Simulation mode. The software also offers a set
of benchmark datasets for testing and demonstrating ASReview LAB. You can
donate your dataset to the `benchmark
platform <https://github.com/asreview/systematic-review-datasets >`_.

High Quality Data
-----------------

When you import your dataset, remove duplicates and retrieve the text in as
many empty fields as possible (See Importance-of-abstracts blog for help).
With clean data, you benefit most from what active learning has to offer.







To perform a systematic review, ASReview requires a dataset representing
all records (e.g., abstracts of scientific papers) obtained in a systematic
search. To create such a dataset for a systematic review, typically an `online
library search <https://asreview.ai/blog/the-importance-of-abstracts/>`__ is
performed for all studies related to a particular topic.

It is possible to use your own dataset with unlabeled, :doc:`data_labeled`
(where the labeled records are used for training a model for the unlabeled records),
or fully labeled records (used for the Simulation mode). For testing and
demonstrating ASReview (used for the Exploration mode), the software offers :ref:`data_labeled:Benchmark datasets`.

.. warning::

    When you import your data, make sure to remove duplicates and to retrieve
    as many abstracts as possible (`See Importance-of-abstracts blog for help
    <https://asreview.ai/blog/the-importance-of-abstracts/>`_). With clean data you
    benefit most from what :doc:`active learning <about>`
    has to offer.



Compatibility
-------------

Citation Managers
~~~~~~~~~~~~~~~~~

The following table provides an overview of export files from citation
managers which are accepted by ASReview.

+-------------------------------+----------+----------+----------+
|                               | **.ris** | **.csv** | **.xlsx**|
+-------------------------------+----------+----------+----------+
| **EndNote**                   | ✅       | N/A      | N/A      |
+-------------------------------+----------+----------+----------+
| **Excel**                     | N/A      | ✅       | ✅       |
+-------------------------------+----------+----------+----------+
| **Mendeley**                  | ✅       | N/A      | N/A      |
+-------------------------------+----------+----------+----------+
| **Refworks**                  | ✅       | N/A      | N/A      |
+-------------------------------+----------+----------+----------+
| **Zotero**                    | ✅       | ✅       | N/A      |
+-------------------------------+----------+----------+----------+

-  ✅ = The data can be exported from the citation manager and imported in ASReview.
-  N/A = This format does not exist.


RIS files used for screening in ASReview LAB can be imported back into the
reference software and the decision labels can be found in the notes field.
For more information see this `instruction video <https://youtu.be/-Rw291AE2OI>`_.

Note: the RIS-pipeline is extensively tested for reference managers Zotero and EndNote.
However, it might also work for other reference managers but is currently not supported.


.. note::

  When using EndNote use the following steps to export a RIS file (.ris):

  - In EndNote, click on the style selection dropdown menu from the main EndNote toolbar.
  - Click "Select Another Style".
  - Browse to RefMan (RIS) Export and click "Choose".
  - Click on the file menu and select "Export".
  - Pick a name and location for the text file.
  - Choose the output format RefMan (RIS) Export and click "Save".



Search Engines
~~~~~~~~~~~~~~

When using search engines, it is often possible to store the articles of
interest in a list or folder within the search engine itself. Thereafter, you
can choose from different ways to export the list/folder. When you have the
option to select parts of the citation to be exported, choose the option which
will provide the most information.

The export files of the following search engines have been tested for their
acceptance in ASReview:

+-----------------+----------+----------+----------+-----------+
|                 | **.ris** | **.tsv** | **.csv** |  **.xlsx**|
|                 |          |          |          |           |
+-----------------+----------+----------+----------+-----------+
|**CINHAL**       | X        | N/A      | X        | N/A       |
|**(EBSCO)**      |          |          |          |           |
+-----------------+----------+----------+----------+-----------+
|**Cochrane**     | ✅       | N/A      | ✅       | N/A       |
+-----------------+----------+----------+----------+-----------+
| **Embase**      | ✅       | N/A      | ✅       | ✅        |
+-----------------+----------+----------+----------+-----------+
|**Eric (Ovid)**  | X        | N/A      | N/A      | X         |
+-----------------+----------+----------+----------+-----------+
|**Psychinfo**    | X        | N/A      | N/A      | X         |
|**(Ovid)**       |          |          |          |           |
+-----------------+----------+----------+----------+-----------+
| **Pubmed**      | X        | N/A      | X        | N/A       |
+-----------------+----------+----------+----------+-----------+
| **Scopus**      | ✅       | N/A      | ✅       | N/A       |
+-----------------+----------+----------+----------+-----------+
|**Web of**       | X        | X        | N/A      | N/A       |
|**Science**      |          |          |          |           |
+-----------------+----------+----------+----------+-----------+

-  ✅ = The data can be exported from the search engine and imported in ASReview.
-  N/A = This format does not exist.
-  X = Not supported.

.. warning::

    If the export of your search engine is not accepted in ASReview, you can
    also try the following: import the search engine file first into one of
    the citation managers mentioned in the previous part, and export it again
    into a format that is accepted by ASReview.

Systematic Review Software
~~~~~~~~~~~~~~~~~~~~~~~~~~

There are several software packages available for systematic reviewing, see
for an `overview <https://arxiv.org/abs/2006.12166>`_. Some of them use machine
learning, while other focus on screening and management. The overview below
shows an overview of alternative software programs and the compatibility with
ASReview.

+-----------------+-----------+----------+----------+----------+
|                 | **.ris**  | **.tsv** | **.csv** | **.xlsx**|
|                 |           |          |          |          |
+-----------------+-----------+----------+----------+----------+
| **Abstrackr**   | ✅        | N/A      | ✅       | N/A      |
+-----------------+-----------+----------+----------+----------+
| **Covidence**\* | ✅        | N/A      | ✅       | N/A      |
+-----------------+-----------+----------+----------+----------+
| **Distiller**   | X         | N/A      | ✅\**    | ✅\**    |
+-----------------+-----------+----------+----------+----------+
|**EPPI-reviewer**| ✅        | N/A      | N/A      | X        |
+-----------------+-----------+----------+----------+----------+
| **Rayyan**      | ✅        | N/A      | ✅       | N/A      |
+-----------------+-----------+----------+----------+----------+
|**Robotreviewer**| N/A       | N/A      | N/A      | N/A      |
+-----------------+-----------+----------+----------+----------+

-  ✅ = The data can be exported from the third-party review software and imported in ASReview.
-  N/A = This format does not exist.
-  X = Not supported.

\* When using Covidence it is possible to export articles in ``.ris`` format for different citation managers,
such as EndNote, Mendeley, Refworks and Zotero. All of these are compatible with ASReview.

\** When exporting from Distiller and if the following error occurs ``Unable to parse string "Yes (include)" at position 0``
set the ``sort references by`` to ``Authors``. Then the data can be imported in ASReview.


