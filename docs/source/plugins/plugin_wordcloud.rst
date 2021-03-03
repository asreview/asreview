Worcloud
========

ASReview-wordcloud is a supplemental package for the `ASReview`_ software
software. It is an easy way to create a visual impression of the contents of
datasets.

.. _ASReview: https://github.com/asreview/asreview

Installation
------------

The easiest way to install the plugin is to install from
PyPI:

.. code:: bash

    pip install asreview-wordcloud

After installation of the package, ``ASReview`` should
automatically detect it. Test this by:

.. code:: bash

    asreview --help

It should list the 'wordcloud' modus.

Basic usage
-----------

The dataset should contain a column containing :doc:`titles and/or abstracts<../intro/datasets>`.
To use your data use:

.. code:: bash

	asreview wordcloud MY_DATA.csv

The following shows the :ref:`Schoot et al. (2017) dataset <benchmark-datasets>`

.. figure:: https://github.com/asreview/asreview-wordcloud/blob/main/figures/ptsd_all.png?raw=true


To make a wordcloud on titles only, use the `title` flag.

.. code:: bash

	asreview wordcloud MY_DATA.csv --title

To make a wordcloud on abstracts only, use the `abstract` flag.

.. code:: bash

	asreview wordcloud MY_DATA.csv --abstract


To make a wordcloud on relevant (inclusions) only, use the `relevant` flag.

.. code:: bash

	asreview wordcloud MY_DATA.csv --relevant


Save the wordcloud to a file with the `-o`  flag.

.. code:: bash

	asreview wordcloud MY_DATA.csv -o MY_DATA_WORDCLOUD.png


More options are described on `Github <https://github.com/asreview/asreview-wordcloud/>`_.
