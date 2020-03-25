Quick Tour
==========

This tutorial will guide you through the ASReview software.

1. Launching ASReview
=====================

This tutorial assumes you have already installed Python and ASReview. If
this is not the case, please check out `10 minutes into ASReview`_.

Now, to launch the ASReview user interface, run the following in your
shell:

::

   asreview oracle

2. Creating a New Project
=========================

Upon launching ASReview you arrive at the project page. Continue with an
already existing systematic review project by clicking on it, or start a
new project by clicking the red + sign in the bottom right corner:

|image0|

--------------

Creating a new project consists of five steps. First, provide
information on your systematic review project:

|image1|

--------------

Second, select the data set you want to review. Your data set should
contain the titles and abstracts of all publications you want to screen.
You can either upload `your own data set`_ or choose one of the built-in
data sets:

|image2|

--------------

At step 3 you are asked to select prior inclusions: the publications of
which you already know they are relevant for your systematic review. You
can search your data set by authors, keywords and title, or a
combination thereof.

Providing the software with prior information gives the software a head
start. Note that there are no restrictions on the number of publications
you need to provide, ASReview also works with 0 prior inclusions.
However, providing more than 10 prior inclusions is not necessary,
preferably provide 1-5 prior inclusions. Enter your search terms (for
example “bat”) and confirm by clicking the magnifying glass icon.

|image3|

From the obtained search result, select the publication(s) you had in
mind by clicking the heart icon. Press return to go back to the search
engine.

|image4|

Repeat this step until you’ve selected your 1-5 prior inclusions. Your
prior inclusion(s) will be displayed below the search field.

|image5|

--------------

Fourth, you will be presented with five publications randomly sampled
from the data set. Indicate for each publication whether it is relevant
or irrelevant to your systematic review.

Given that the majority of publications in the data set is irrelevant to
your systematic review, the publications presented here will most
probable be excluded from your systematic review. This provides the
software with additional information on what kind of publications should
be excluded from your systematic review.

|image6|

--------------

Based on the information you have provided, the software is now building
a machine learning model that predicts which other, still unseen
publications in your data set should be in

.. _10 minutes into ASReview: https://asreview.readthedocs.io/en/latest/10minutes_asreview.html#installing-the-asreview-software
.. _your own data set: https://asreview.readthedocs.io/en/latest/datasets.html#using-your-own-data

.. |image0| image:: images/0_projects_page.png
.. |image1| image:: images/1_create_project.png
.. |image2| image:: images/2_select_dataset.png
.. |image3| image:: images/3_include_publications.png
.. |image4| image:: images/3.2_include_publications_bat.png
.. |image5| image:: images/3.3_include_publications.png
.. |image6| image:: images/4_label_random.png