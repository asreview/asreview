Exploration Mode
================

The exploration mode can be used to explore to performance of the active
learning software and the performance of :ref:`different algorithms
<feature-extraction-table>` on already labeled data. In this mode relevant
records are displayed in green and a recall curve can be obtained.

Upload a Benchmark Dataset
--------------------------

Select one of the available :ref:`benchmark-datasets <benchmark-datasets>`.

.. figure:: ../../images/asreview_prescreening_demo_datasets.png
   :alt: Demo datasets


Prior Inclusions
~~~~~~~~~~~~~~~~

In the next step, you are asked to add prior inclusions. Select 1-5 papers of
your choice. For the featured datasets you can use the following titles of
papers:

Prior Exclusions
~~~~~~~~~~~~~~~~

Mark five random papers as irrelevant.


START reviewing
~~~~~~~~~~~~~~~

Start reviewing the first 50, 100 or even 200 papers. Abstracts in green are
relevenant papers and abstracts in black are irrelevant.

- For the *PTSD Trajectories* dataset you expect to find about 7 out of 38 relevant papers after screening 50 papers, 19 after screening 100 papers and 36 after 200 papers.
- For the *Virus Metagenomics* dataset you expect to find 20 out of 120 relevant papers after screening 50 papers, 40 after screening 100 papers and 70 after 200 papers
- For the *Software Fault Prediction* dataset you expect to find 25 out of 104 relevant papers after screening 50 papers, 48 after screening 100 papers and 88 after 200 papers.
- For the *ACEinhibitors* dataset you expect to find 16 out of 41 relevant papers after screening 50 papers, 27 after screening 100 papers and 32 after 200 papers.


Upload Your own Data for Exploration
------------------------------------

You can explore a previously labeled dataset in ASReview LAB by adding an
extra column called ‘debug_label’ to your dataset. This column should indicate
the relevant (1) and irrelevant (0) records. The relevant records will show up
green during screening.

1. Open ASReview LAB.
2. Start a new project.
3. Click the *Start Setup* button.
4. Select your labeled dataset containing the ‘debug_label’.
