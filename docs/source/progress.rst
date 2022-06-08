Progress and results
====================



Analytics
---------

ASReview LAB offers some insightful statistics and graphs to keep track of
your screening process and help you to decide when to stop screening.

To open
the statistics panel:

1. :doc:`start`.
2. Open or :doc:`project_create`.
3. Click on Analytics on in the left menu.







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

Stop screening
--------------

The `blogpost
*ASReview Class 101* <https://asreview.ai/blog/asreview-class-101/>`_ and the
`How to stop screening?
<https://github.com/asreview/asreview/discussions/557>`_ discussion provide
tips on when to stop with screening.

Mark project as finished
------------------------

When you decide to stop screening, you can mark the project as finished. You
can undo this at any time. To mark your project as finished:

1. :doc:`start`.
2. Go to the *Projects dashboard* (http://localhost:5000/projects)
3. Hover the project you want to mark as finished and click on *Options*.
4. Click on *Mark as finished*.

The button to continue screening is now disabled. This can be undone by
clicking again on *Mark as in review*.


Export results
--------------

You can export the results of your screening to a RIS, CSV, TSV or Excel file.
A file contains all imported data including your decisions. The file is ordered as follows:

1. All relevant records you have seen in the order they were shown during the screening process.
2. All records not seen during the screening and ordered from most to least relevant according to the last iteration of the model.
3. All non-relevant records are presented in the order these are shown during the screening proces.


To download your results follow these steps:

1. :doc:`start`.
2. Open or :doc:`project_create`.
3. Click on *Export* in the menu on the left.
4. Select *Dataset*.
5. Select the file type for prefer: i.e. Excel, RIS, TSV, or CSV file.
6. Save the file to your device.

.. figure:: ../images/project_export_dataset.png
   :alt: ASReview LAB dataset download

.. note::

    A RIS file can only be exported if a RIS file is imported.

The following variables will be added to your dataset:

- The column titled **included** contains the labels as provided by the user:
  ``0`` = not relevant, ``1`` = relevant and if missing it means the record is
  not seen during the screening process.
- The column titled **asreview_ranking** contains an identifier to
  preserve the rank ordering as described above.


