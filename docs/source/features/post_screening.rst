Post-Screening
==============

After you decide to `stop screening <https://github.com/asreview/asreview/discussions/557>`_ 
or anytime you want to take a break, you can
return to the project dashboard by clicking the hamburger menu on the
top-left. Below, you will find the options in the project dashboard.


Download Results
----------------

A file containing all meta-data including your decisions can be downloaded
any time during the screening process. To download your results:

1. Open ASReview LAB.
2. Start a new project, upload a dataset and select prior knowledge.
3. Navigate to the Project Dashboard.
4. Click the *download* icon (see screenshot below), or click on *Download Results*.
5. You will be asked to download an Excel, RIS, TSV, or CSV file.
6. You will be asked where to save the file.

.. warning::

    A RIS file can only be exported if a RIS file is imported.

Three columns will be added to your dataset:

The column titled **included** contains the labels as provided by the user:
``0`` = not relevant, ``1`` = relevant and if missing it means the record is
not seen during the screening process. First, all relevant records are
presented in the order these shown during the screening process. Then, all
records not seen during the screening proces are presented ordered from most
to least relevant according to the last iteration of the model. At end of the
file all non-relevant records are presented in the order these are shown
during the screening proces.

The column titled **asreview_ranking** contains an identifier to
preserve the rank ordering as described above.

If present, the column **record_id** contains the values of the original
**record_id** as included by the user. If not available, ASReview generates a
new record_id, based on the row number and starting at 0.

.. figure:: ../../images/asreview_project_page_download.png
   :alt: ASReview project download


.. _export-project:

Export Project
--------------

An ASReview project file can be downloaded containing all information needed to
replicate the project or to import the project on a different device. To
export your project:

1. Open ASReview LAB.
2. Start a new project, upload a dataset and select prior knowledge.
3. Navigate to the Project Dashboard.
4. Click on *Export this project*.
5. You will be asked where to save the ASReview file (extension `.asreview`).

Finished
--------

When you are done with the review, you can mark the project as finished. To
mark your project as finished:

1. Open ASReview LAB.
2. Open a project.
3. Click on *Mark Screening as finished*.

The button to continue screening is now disabled. This can be undone by
clicking again on *Mark Screening as finished (undo)*.


Delete a Project
----------------

To permanently delete a project, including ALL files:

1. Open ASReview LAB.
2. Start a new project, upload a dataset and select prior knowledge.
3. Navigate to the Project Dashboard.
4. Click on *Delete this project*.
5. This action cannot be made undone, ASReview LAB will ask you to confirm by typing in the project title.
