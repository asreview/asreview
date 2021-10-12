Overview
========

The development section is meant for the more advanced user of ASReview. It
contains information on the technical aspects of usage, instructions for developing
extensions, and an extensive API reference.

ASReview structure
------------------

ASReview provides users an API to interact directly with the underlying ASReview
machinery. This provides researchers an interface to study the behavior of
algorithms and develop custom workflows. The following figure shows the
available interfaces for interacting with the ASReview software:

..
  Source file of image can be found at
  https://github.com/asreview/asreview-artwork/tree/master/LayerOverview

.. figure:: ../../figures/asreview_layers_light_no_BG.png
   :alt: ASReview API


Development documentation
-------------------------
In the development documentation, the following sections are found:

* Layer 1: :doc:`reference`

    - The ASReview API is a low level Python interface for ASReview. This
      interface requires detailed knowledge about the workings of the software.
      This reference contains extensive documentation on all functions, classes,
      and modules found in ASReview.
    
    - An outline for usage can be found in :doc:`../guides/api`.

* Layer 2: :doc:`cli`

    - The Command Line is an interface used to open ASReview LAB, run
      simulations, and run :ref:`extensions/overview_extensions:Subcommand
      Extensions` for ASReview. This development section documents all available
      command line options for both ASReview LAB and simulation mode.
    
    - For more information on using the simulation mode, see
      :doc:`../guides/sim_overview`.

* Layer 3: REST API

    - The REST API uses a Flask REST API to provide a method to let the React
      front-end communicate with the backend and algorithms. The REST API is not
      documented and should be considered 'internal use only'.

* Layer 4: :doc:`ASReview LAB <../lab/overview_lab>`

    - ASReview is the user friendly front-end for ASReview. Documentation on LAB
      can be found in the :doc:`ASReview LAB section <../lab/overview_lab>`.

* Layer 5: ASReview CLOUD

    - ASReview is currently in development. For information on ASReview CLOUD,
      be sure visit our communication channels.



* Section: :doc:`extension_dev`

    - The Create an extension section documents the creation of model, subcommand,
      and dataset extensions for ASReview. 
      
    - More information on extensions can be found in the extension
      :doc:`../extensions/overview_extensions`.