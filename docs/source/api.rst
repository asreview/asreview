Application Programming Interface (API)
=======================================

For more control over the workings of the ASReview software, a API is provided.
For example, it is possible to define a new model or sampling strategy and use it with ASReview.

The easiest way to start a review using the API is to use the factory, see 
:func:`asreview.review.get_reviewer`.

There are two modes: oracle (review) and simulation (benchmark).

Oracle mode
-----------

An example that uses the ASReview API (fill in DATA_FILE and 
EMBEDDING_FILE with valid filenames):

.. code-block:: python

	import asreview
	from asreview.models import create_lstm_pool_model

	from tensorflow.python.keras.wrappers.scikit_learn import KerasClassifier
	
	# load data
	data, texts, _ = asreview.read_data(DATA_FILE)
	
	# create features and labels
	X, word_index = asreview.text_to_features(texts)
	
	# Load embedding layer.
	embedding = asreview.load_embedding(EMBEDDING_FILE, word_index=word_index)
	embedding_matrix = asreview.sample_embedding(embedding, word_index)
	
	# create the model
	model = KerasClassifier(
	    create_lstm_pool_model(embedding_matrix=embedding_matrix),
	    verbose=1,
	)
	
	# start the review process.
	reviewer = asreview.ReviewOracle(
	    X,
	    data=data,
	    model=model,
	    n_instances=10,
	    prior_included=PRIOR_INC_LIST,  # List of some included papers
	    prior_excluded=PRIOR_EXC_LIST,  # List of some excluded papers
	)
	reviewer.review()


Simulation mode
---------------

An example of use the API for the simulation mode:

.. code-block:: python

	import asreview
	from asreview.models import create_lstm_pool_model
	
	from tensorflow.python.keras.wrappers.scikit_learn import KerasClassifier
	
	# load data
	_, texts, y = asreview.read_data(DATA_FILE)
	
	# create features and labels
	X, word_index = asreview.text_to_features(texts)
	
	# Load embedding layer.
	embedding = asreview.load_embedding(EMBEDDING_FILE, word_index=word_index)
	embedding_matrix = asreview.sample_embedding(embedding, word_index)
	
	# create the model
	model = KerasClassifier(
	    create_lstm_pool_model(embedding_matrix=embedding_matrix),
	    verbose=1,
	)
	
	# start the review process.
	reviewer = asreview.ReviewSimulate(
	    X,
	    y=y,
	    model=model,
	    n_instances=10,
	    prior_included=PRIOR_INC_LIST,  # List of some included papers
	    prior_excluded=PRIOR_EXC_LIST,  # List of some excluded papers
	)
	reviewer.review()
