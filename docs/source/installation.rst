Installation
============

The following documentation will guide you in installing the ASReview software.

.. contents:: Table of Contents


Install Python 
--------------
The ASReview software runs with Python in the background. 
Installing ASReview requires having Python 3.6+ installed. More knowledge about Python is not necessary to rus ASReview, but if you want to know more you van look on their website `Python <https://www.python.org/about/>`__.

Windows
~~~~~~~

First check if Python is already installed on your computer. Open the program
`CMD.exe` on your computer. Type the following

.. code:: bash

    python --version

If the command returns `'python' is not recognized as an internal or external
command`, then Python isn't installed. If your Python version is 3.6.x or
higher, you can proceed to 
`section 'Installing ASReview' <#install-asreview>`__. 

To install a recent version of Python, we recommend to install Anaconda.
Anaconda offers a user-friendly Python environment. Install Anaconda from 
the website `Anaconda for Windows <https://docs.anaconda.com/anaconda/install/windows/>`__.
Make sure to add Anaconda to your PATH environment variable when asked.
Afterwards, repeat the step above to check if Python is installed. 

MacOS
~~~~~

First check if Python is already installed on your computer. Open the program
`terminal` on your computer. Type the following

.. code:: bash

    python --version

If the command returns `python: command not found`, then Python isn't
installed. If your Python version is 3.6.x or higher, you can proceed to
`section 'Installing ASReview' <#install-asreview>`__.

To install a recent version of Python, we recommend to install Anaconda.
Anaconda offers a user-friendly Python environment. Install Anaconda from 
the website `Anaconda for MacOS <https://docs.anaconda.com/anaconda/install/mac-os/>`__.
Make sure to add Anaconda to your PATH environment variable when asked.




Install ASReview
----------------

If your Python version is 3.6+, you can start installing the ASReview
software on your computer. 

To install the ASReview software, run the following in the `CMD.exe` (Windows)
or `terminal` (MacOS):

.. code:: bash

    pip install asreview

If ASReview was installed succesfully, the last line should return
`Successfully installed asreview-0.9`


You are now ready to start your first Automated Systematic Review! 
Follow the the step in our Quick Tour.

In case you do not get this output, please consult
`the FAQ <faq.html>`__ to solve the issue.


Upgrade ASReview
~~~~~~~~~~~~~~~~

Upgrade ASReview software with 

.. code:: bash

    pip install --upgrade asreview


Server installation
-------------------

Although ASReview should only be used in closed networks, it is possible to
run on a server or custom domain. Use the command line arguments `ip` and
`port` for configuration.

.. code:: bash

    asreview oracle --port 5555 --ip xxx.x.x.xx

Troubleshooting
---------------

Unknown command "pip" on command line or terminal
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you get one of the following errors:

.. code:: bash

  -bash: pip: No such file or directory

.. code:: bash

  'pip' is not recognized as an internal or external command, operable program or batch file.

Most likely, the enviroment variables aren't configured correctly. There are
tutorials on the internet to deal with this. However, a simple way to deal
with this is adding `python -m` in front of the command. For example:


.. code:: bash

  python -m pip install asreview


Unknown command "asreview" on command line or terminal
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In some situations, the entry point "asreview" can not be found after installation.
First check whether the package is correctly installed. Do this with the command 
`python -m asreview -h`. If this shows a decription of the program, please use 
`python -m` in front of all your commands. For example:


.. code-block:: bash

  python -m asreview oracle


Python3 command
~~~~~~~~~~~~~~~

Some users have to call the `python3` binary instead of just `python`. At the
moment, this will result is a freeze in Step 5 of the review. The model is not
able to train. Solve this by making `python3` the default `python` executable
on your device or make a virtual environment.

.. code:: bash
  
    python3 -m venv asreview/env
    source ~/asreview/env/bin/activate

Install and run `asreview` in the virtual enviroment.

.. code:: bash
  
    pip install asreview
    asreview oracle

For more details on creating a virtual environment, please have a look at
https://docs.python.org/3/library/venv.html. 
