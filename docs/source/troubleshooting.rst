Troubleshooting
===============

ASReview LAB is advanced machine learning software. In some situations, you
might run into unexpected behavior. Please see below for solutions to
problems.

Remove temporary files
----------------------

In case ASReview runs into unexpected errors or doesn't work as expected, it
is advised to try to remove temporary files from the project first. These
files can be found in the ``.asreview/`` folder in your home directory.
However, the easiest way to remove these files is with:

.. code:: bash

	asreview lab --clean_all_projects

This will safely remove temporay files, nothing will harm your review. To
clean a specific project, use

.. code:: bash

	asreview lab --clean_project my-project

in which ``my_project`` is your project name.
