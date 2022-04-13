Install ASReview LAB with pip
=============================

System requirements
-------------------

- Python 3.7 or later
- Linux
- macOS
- Windows

.. _install_python:

1. Install the Python environment on your system
------------------------------------------------

Check if your Python environment is already configured:

.. note::

    Requires Python 3.7 or later.

Open `Terminal
<https://support.apple.com/guide/terminal/open-or-quit-terminal-apd5265185d-f365-44cb-8b09-71a064a42125/mac>`__
(Linux/macOS) or `Command Prompt
<https://www.lifewire.com/how-to-open-command-prompt-2618089>`__ (Windows) and enter:

.. code-block:: bash

    python --version

If the Python environment is already installed, skip to the next step.

Otherwise, install Python:

.. tabs::

  .. tab:: Linux

    .. code-block::

      sudo apt update
      sudo apt install python3.7

  .. tab:: macOS

    Install using Miniconda:

    1. Go to the `Miniconda3 macOS installers
       <https://docs.conda.io/en/latest/miniconda.html#macos-installers>`__.
    2. Download and install the latest `Miniconda3 macOS 64-bit pkg`.

  .. tab:: Windows

    Install the 64-bit `Python 3 release for Windows
    <https://www.python.org/downloads/windows/>`__ (select `pip` as an optional
    feature).

    .. important::

        Check the box to `add Python to your PATH environment variable` during the
        installation.

2. Install the ASReview LAB pip package
---------------------------------------

.. code-block:: bash

    pip install --upgrade asreview

.. note::

    For users of Apple M1 computers, if you experience problems, follow the
    `instructions
    <https://github.com/asreview/asreview/issues/738#issuecomment-919685562>`__. Some
    Python packages are not available through `pip`.

3. Start ASReview LAB
---------------------

.. code-block:: bash

    asreview lab

.. tip::

    ASReview LAB is now installed. Get started.

If you experience some problems, try :doc:`troubleshooting </install/ts>`.
