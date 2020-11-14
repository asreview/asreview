Pre-Screening
=============

Before you can actually start screening you have to start a project and set-up
your model. We discuss the options below.

.. contents:: Table of Contents


Start a new project
-------------------

To start a new project:

1. Open ASReview LAB.
2. Start a new project by clicking the '+' button in the right-down corner.
3. Select *New project*.

In a pop-up screen you will be asked to fill-in a project name (obligatory),
your name (or any name), and a description if you like.

[SCREENSHOT OF BOTH THE BUTTON AND POP-UP]


Open an existing project
------------------------

To open an existing project:

1. Open ASReview LAB.
2. Click on the title of a project or on the button *open*.

You will be redirected to the :doc:`project dashbboard <Post-screening>`.

[SCREENSHOT]


Import a project
----------------

To import an existing project file (and continue screening, or to inspect the results):

1. Open ASReview LAB.
2. Click on the '+' button.
3. Select *Import project*.

A pop-up will open and you will be asked to select the .asreview file.

[SCREENSHOT]


Start Set-up
------------

After you have started a project, you are redirected to the project dashboard
and you will first be asked to start the setup.

1. Open ASReview LAB.
2. Start a new project.
3. Click the *Start Setup* button.

[SCREENSHOT]

Already in this project dashboard some of the features are available which are
described in the :doc:`Post-screening` section.

Select Database
---------------

To select a dataset:

1. Open ASReview LAB.
2. Start a new project.
3. Click the *Start Setup* button.
4. Choose one of the four options:

a: Upload a file by Drag 'n' Drop, or select a file via the browser. The data needs to adhere to a :doc:`specific format<../intro/datasets>`. If a file is uploaded and reckognized as one of the available formats, it will display the message *Successful upload* and provide the number of records in the database.

[SCREENSHOT]

b:


Select Model
------------

It is possible to change the settings of the Active learning model. There are
three ingredients that can be changed in the software: the type of classifier,
the query strategy and the feature extraction technique.

To change the default setting:

1. Open ASReview LAB.
2. Start a new project, upload a dataset and select prior knowledge.
3. Click on the **edit** button.
4. Using the drop-down menu select a different classifier, query strategy or feature extraction technique.
5. Click Finish.


[ADD SCREEN SHOT]


The classifier is the machine learning model used to compute the relevance
scores. The available classifiers are Naive Bayes, Support Vector
Machine, Logistic Regression, and Random Forest. More classifiers can be
selected via the :doc:`API <../API/reference>`. The default is Naive Bayes,
though relatively simplistic, it seems to work quite well on a wide range of
datasets.

The query strategy determines which document is shown after the model has
computed the relevance scores. With certainty-based is selected the document
with the highest relevance score is showed followed by the 2nd in line,
etcetera, untill a new model is trained with new relevance scores. When
uncertainty-based is selected, the most uncertain docuemtn is sampled
according to the model (i.e. closest to 0.5 probability).  When random is
selected, as it says, randomly select samples with no regard to model assigned
probabilities. **Warning**: selecting this option means your review is not
going to be accelerated by ASReview.

The feature extraction technique determines the method how text is translated
into a vector that can be used by the classifier. The default is TF-IDF (Term
Frequency-Inverse Document Frequency) from `SKLearn <https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html>`_.
It works well in combination with Naive Bayes and other fast training models.
Another option is Doc2Vec provided by the `gensim <https://radimrehurek.com/gensim/>`_
package which needs to be installed manually.
To use it, install the gensim package manually:

.. code:: bash

    pip install gensim

It takes relatively long to create a feature matrix with this method. However,
this only has to be done once per simulation/review. The upside of this method
is the dimension-reduction that generally takes place, which makes the
modelling quicker.




