Get started
===========

The development section is meant for users that need advanced functions of
ASReview LAB and for developers. It contains technical information on the
usage, instructions for developing extensions, and an extensive API reference.

ASReview architecture
---------------------

ASReview provides users an API to interact directly with the underlying ASReview
machinery. This provides researchers an interface to study the behavior of
algorithms and develop custom workflows. The following overview shows the
available interfaces for interacting with the ASReview software:

.. figure:: ../../figures/architecture.png
   :alt: ASReview API


Core Interfaces
---------------

* **API**

  - ASReview LAB ships with a documented Application Programming Interface
    (API) that provides models, data, and project management functionality.
    The rich set of functions, classes, and modules allow researchers and
    developers to develop custom workflows, integrate new algorithms, or embed
    ASReview functionality in larger projects. It is also the foundation for
    the higher-level interfaces of ASReview LAB. For detailed documentation,
    refer to the :doc:`API reference <reference>`.

* **REST API**

    - A stateless REST API written in Flask provides an interface for web
      applications built on ASReview. While integral to ASReview LAB, this REST
      API is still under active development and is not yet fully documented.

* **CLI**

    - The Command Line Interface (CLI) of ASReview provides an interface for
      users of computer terminals to start ASReview LAB, run simulations, list
      algorithms, and more. After installing ASReview via PIP
      (https://pypi.org/project/asreview/), the command `asreview lab` will
      start the user-friendly web app interface written in React that is
      available in all major browsers.

    - Furthermore, `--help` lists available subcommands, their origin package,
      and their version. It can also be extended with subcommands provided by
      both official and community-built extensions. The general command
      structure is `asreview [-h] [-V] [subcommand]`.

Servers
-------

* **Task Server**

    - ASReview LAB v2 introduces a new task server for handling asynchronous
      tasks like training agents and running simulations. The task server comes
      with a network socket interface and makes use of Transmission Control
      Protocol (TCP) for communication. New tasks are sent to the task server,
      and the progress is logged. In its config file, you can set the port, the
      host, and the number of workers.

* **LAB Server**

    - The LAB server runs on Flask and serves the RESTful API.


Extensions
----------

:doc:`The Create an extension <extensions_dev>` section documents the creation
of model, subcommand, and dataset extensions for ASReview. More information on
extensions can be found in the extension
:doc:`extensions_dev`.
