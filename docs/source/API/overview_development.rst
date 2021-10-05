Overview
========

The development section of this guide is meant for the more advanced user of
ASReview. It contains information on technical aspects of usage, instructions
for developing extensions, and an API reference.

ASReview structure
------------------

ASReview provides users an API to interact directly with the underlying
ASReview machinery. This provides researchers an interface to study the
behavior of algorithms and develop custom workflows. The following figure
shows the available interfaces for interacting with the ASReview software:

.. figure:: ../../figures/asreview_api.png
   :alt: ASReview API

.. note::
  The REST API uses a Flask REST API to provide a method to let the React
  front-end communicate with the backend and algorithms. The REST API is not
  documented and should be considered 'internal use only'.


Development documentation
-------------------------

* Section :doc:`cli`:

  The :doc:`cli` is an interface to open ASReview LAB, to run
  simulations, and more. See :doc:`../guides/sim_overview` for
  example usage.

* Section :doc:`reference`:

  The :doc:`reference` is a low level Python interface for ASReview. This
  interface requires detailed knowledge about the workings of the software.
  There is extensive documentation available on the functions, classes,
  modules. An outline for usage can be found in :doc:`../guides/api`.

* Section :doc:`extension_dev`:

  extensions


