Frequently Asked Questions
==========================


Unknown command "pip" on command line or terminal
-------------------------------------------------

If you get one of the following errors:

.. code:: bash

	-bash: pip: No such file or directory

.. code:: bash

	'pip' is not recognized as an internal or external command, operable program or batch file.

It means that your path is incorrectly set during python installation. See the 
`section 'Install Python' <10minutes_asreview.html#install-python>`__.

Unknown command "asreview" on command line or terminal
------------------------------------------------------

In some situations, the entry point "asreview" can not be found after installation.
First check whether the package is correctly installed. Do this with the command 
`python -m asreview -h`. If this shows a decription of the program, please use 
`python -m` in front of all your commands. For example:


.. code-block:: bash

	python -m asreview oracle yourfile.csv


How do I work with the Command Line?
------------------------------------

MacOS and Linux users can learn about bash on the website
`programminghistorian.org <https://programminghistorian.org/en/lessons/intro-to-bash#opening-your-shell>`__.
Windows users may also follow this tutorial, but might prefer a tutorial on cmd.exe.
