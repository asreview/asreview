Create an extension
===================

ASReview extensions enable you to integrate your programs with the ASReview
framework seamlessly, by using the Python API. These extensions fall into three
different categories, and interact with the API in different ways.

1. `Model extensions`_
2. `Subcommand extensions`_
3. `Dataset extensions`_

For more information on creating an extension, a technical reference for
development is found under the :doc:`../API/extension_api_reference`.


Model extensions
----------------

Model extensions extent the ASReview software with new classifiers, query
strategies, balance strategies, or feature extraction techniques. 

An example of a model extension is the `model extension template
<https://github.com/asreview/template-extension-new-model>`_

Subcommand extensions 
---------------------

Subcommand extensions are programs that create a new entry point for ASReview.
From this entry point the Python API can be used in many ways (like ``plot`` or
``simulate``).

An example of a subcommand extension is the `Visualization Extension
<https://github.com/asreview/asreview-visualization>`_

Dataset extensions
------------------

Dataset extensions integrate new datasets for use in ASReview. Adding datasets
via extension provides quick access to the dataset via commandline.

An example of a dataset extension is the `Covid-19 Extension
<https://github.com/asreview/asreview-covid19>`_


