Progress and results
====================

During screening, you might want to keep track of your progress and to obtain
information for your stopping criteria. This section provides documentation on
useful tools for these purposes.

Dashboard
---------

ASReview LAB offers insightful statistics and charts to help you monitor your
progress.

To open the dashboard:

1. :doc:`start`.
2. Click on *Dashboard* in the left menu.

For all of the statistics and charts, you can find information on how they work
by clicking on the lamp icon in the top right corner of a statistic or chart.
Feel free to ask questions about the statistics and charts on the Discussion
platform https://github.com/asreview/asreview/discussions.


.. figure:: ../../images/fullscreen_projects.png
   :alt: ASReview LAB progress Dashboard

   The Dashboard of a review that almost hit the stopping criteria.


Stop screening
--------------

On the dashboard, you can set a stopping criteria for your screening. The
stopping criterium is a threshold for the number of *not relevant* records since
the last *relevant* record. If you reach this threshold, you will be asked to stop
screening. You can decide to stop screening or to continue. As you will most likely see more not relevant records the longer you screen, the
stopping criteria is a useful tool to help you decide when to stop screening.

The stopping treshold is not set by default. You can set the stopping criteria
by clicking on the *Set threshold* button in the top right corner of the
dashboard. The circle will turn dark when the threshold is reached. You can set
the stopping criteria to any number you like. Choose the treshold that works
best for you. Base the threshold on your own experience or simulation studies on
simular topics. The ideal threshold is still actively researched.


In a popular discussion on the ASReview Discussion platform, `How to stop screening?
<https://github.com/asreview/asreview/discussions/557>`_, several stopping strategies
are discussed.

.. tip::

  The wave plot shows the "waves" of irrelevant records. The larger the waves,
  the more irrelevant records you have seen and the more likely you are ready to
  stop. The wave plot displays the threshold you set.


Mark project as finished
------------------------

When you decide to stop screening, you can mark the project as finished. You can
undo this at any time. To mark your project as finished:

1. :doc:`start`.
2. Open the project you want to mark as finished.
3. Click on *Dashboard* if you are not there yet.
4. Click on *In review* in the top right corner of the dashboard.
5. Click on *Mark as finished*.

Continuing screening is now disabled. This can be undone by clicking again on
*Finished* and resume the review.

.. tip::

  You can find some interesting estimates of the time saved on the dashboard
  after marking the project as finished.


Export dataset
--------------

At any moment during the screening process, you can export your dataset. This
includes the labels you provided, the data you imported, and some additional
variables. You can export your dataset to a RIS, CSV, TSV, or Excel file.

To download your dataset follow these steps:

1. :doc:`start`.
2. Open a project.
3. Click on *Collection* in the menu on the left.
4. Click on the *Export* button in the top right corner of the screen.
5. Select the records you want to export.
6. Click on *Export*.

.. note::

    A RIS file can only be exported if a RIS file is imported.



Variables in the exported dataset
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The exported dataset contains the labels you provided during screening, the
data you imported, and some additional variables. The following table lists the
additional variables that are included in the exported dataset:


.. list-table:: Variables in the exported dataset
  :header-rows: 1

  * - Variable
    - Description
  * - **asreview_label**
    - Contains the labels provided by the user: ``1`` for relevant, ``0`` for
      not relevant, and missing if the record was not seen during screening.
  * - **asreview_time**
    - Contains the datatime of the screening decision.
  * - **asreview_note**
    - Contains any notes made by the user during screening.
  * - **asreview_user_name**
    - Contains the name of the user who made the screening decision (if
      applicable).
  * - **asreview_user_email**
    - Contains the email of the user who made the screening decision (if
      applicable).

For RIS files, the variables are stored in the N1 (Notes) field. The
**asreview_label** variable is stored with the `ASReview_relevant` and
`ASReview_irrelevant` tags to find them easily via search option in a reference
manager.

Order of the records in the exported dataset
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The file is ordered as follows:

1. All relevant records you have seen in the order they were shown during the
   screening process.
2. All records not seen during the screening and ordered from most to least
   relevant according to the last iteration of the model.
3. All non-relevant records are presented in the order these are shown during
   the screening process.
