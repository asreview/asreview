Prepare your data
=================

ASReview LAB requires a dataset containing a set of textual records (e.g.,
titles and abstracts of scientific papers, newspaper articles, or policy
reports) obtained via a systematic search. The goal is to review all records
systematically using predetermined inclusion and exclusion criteria. Also, it
should be expected that only a fraction of the records in the dataset is
relevant.

Datasets can be unlabeled as well as :ref:`lab/data_labeled:Partially labeled
data` and :ref:`lab/data_labeled:Fully labeled data`.
See :ref:`lab/project_create:Project modes` for more information.

The easiest way to obtain a dataset is via a search engine or with the help of
a reference manager. See :ref:`lab/data:Compatibility` for reference managers
export formats supported by ASReview. For more information about the format of
the dataset, see :doc:`data_format`.

High-quality data
-----------------

The algorithms of ASReview LAB work best with high-quality datasets. A
high-quality dataset is a dataset with duplicate records removed, and the data
is complete. Complete data implies that titles and abstracts are available for
all (or most) records. See the ASReview blog `Importance of Abstracts
<https://asreview.ai/blog/the-importance-of-abstracts/>`_ for more ideas on
composing a high-quality dataset.

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
For more information see this `instruction video
<https://www.youtube.com/watch?v=-Rw291AE2OI>`_.

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

==================== ======== ======== ======== =========
\                    **.ris** **.tsv** **.csv** **.xlsx**
==================== ======== ======== ======== =========
**CINAHL (EBSCO)**   ✅       N/A      X        N/A
**Cochrane**         ✅       N/A      ✅       N/A
**Embase**           ✅       N/A      ✅       ✅
**Eric (Ovid)**      ✅*      N/A      N/A      N/A
**OpenAlex**         ✅       N/A      ✅       N/A
**Psychinfo (Ovid)** ✅*      N/A      N/A      N/A
**Pubmed**           X        N/A      X        N/A
**Scopus**           ✅       N/A      ✅       N/A
**Web of Science**   ✅       N/A      N/A      N/A
==================== ======== ======== ======== =========

-  ✅ = The data can be exported from the search engine and imported in ASReview.
-  N/A = This format does not exist.
-  X = Not supported, (see :ref:`lab/data_format:Data format` for other options).

\* Make sure to uncheck all inclusion options (e.g., "URL") when exporting from Ovid.

.. tip::

    If the export of your search engine is not accepted in ASReview, you can
    also try the following: import the search engine file first into one of
    the citation managers mentioned in the previous part, and export it again
    into a format that is accepted by ASReview.

Systematic Review Software
~~~~~~~~~~~~~~~~~~~~~~~~~~

There are several software packages available for systematic reviewing, see
https://www.nature.com/articles/s42256-020-00287-7. Some of them use machine
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
