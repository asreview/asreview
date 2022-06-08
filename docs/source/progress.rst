Progress and results
====================

After you decide to `stop screening <https://github.com/asreview/asreview/discussions/557>`_
or anytime you want to take a break, you can
return to the project dashboard by clicking the hamburger menu on the
top-left. Below, you will find the options in the project dashboard.


Statistics Panel
----------------

For unlabeled data, ASReview LAB offers some insightful graphs to keep track
of your screening process so far. To open the statistics panel:

1. :doc:`start`.
2. Open a project.
3. Start screening.
4. Click the **statistics** icon in the upper-right corner.
5. To close the panel click on the '>' icon.

In the top of the statistics panel the project name, authors and total number
of records in the dataset are displayed.

The pie chart presents an overview of how many relevant (green) and
irrelevant (orange) records have been screened so far. Also, the total number
of records screened is displayed, as well as the percentage screened relative
to the total number of records in the dataset.

The second plot is a progress plot. On the x-axis the number of records
screened is tracked. The y-axis shows a moving average. It displays the ratio
between relevant and irrelevant records for a batch of 10 labeled records. If
you hoover over the plot you can see the moving average for any batch of 10
labeled records.

Underneath the progress plot, the number of irrelevant records after the last
relevant is shown. This statistic might help in deciding when to stop
reviewing, see `blogpost *ASReview Class 101*
<https://asreview.ai/blog/asreview-class-101/>`_ for more instructions how to
use this graph.




Download Results
----------------

During the screening or via the Project Dashboard
you can download the results with your decisions by clicking the download
icon. A dialog will show the download options. Choose from the menu whether
you would like to export your results as a RIS, CSV, TSV or an Excel file and click
`Download`.


.. figure:: ../images/asreview_project_page_download.png
   :alt: ASReview project download


A file containing all meta-data including your decisions can be downloaded
any time during the screening process. To download your results:

1. :doc:`start`.
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

.. figure:: ../images/asreview_project_page_download.png
   :alt: ASReview project download


A file containing all metadata including your decisions can be downloaded
any time during the screening process. To download your results:

1. :doc:`start`.
2. Open a project.
3. Start screening.
4. Click the **download** icon in the upper-right corner.
5. You will be asked whether you want to save an Excel or a CSV file.
6. You will be asked where to save the file.


.. figure:: ../images/asreview_screening_result.png
   :alt: ASReview download results



Finished
--------

When you are done with the review, you can mark the project as finished. To
mark your project as finished:

1. :doc:`start`.
2. Open a project.
3. Click on *Mark Screening as finished*.

The button to continue screening is now disabled. This can be undone by
clicking again on *Mark Screening as finished (undo)*.
