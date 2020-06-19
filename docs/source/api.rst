Application Programming Interface (API)
=======================================

For more control over the workings of the ASReview software, a API is provided.
For example, it is possible to define a new model or sampling strategy and use it with ASReview.

The easiest way to start a review using the API is to use the factory, see 
:func:`asreview.review.get_reviewer`.


Simulation mode
---------------

An example of use the API for the simulation mode:

.. code-block:: python

	import asreview
	from asreview.models import LSTMBaseModel
	from asreview.query_strategies import MaxQueryModel
	from asreview.balance_strategies import SimpleBalanceModel
	from asreview.feature_extraction import EmbeddingLSTM


	# load data
	as_data = asreview.ASReviewData.from_file(DATA_FILE)

	train_model = LSTMBaseModel()
	query_model = MaxQueryModel()
	balance_model = SimpleBalanceModel()
	feature_model = EmbeddingLSTM()

	# Load the embedding matrix, only necessary for lstm models.
	train_model.embedding_matrix = feature_model.get_embedding_matrix(
		as_data.texts, EMBEDDING_FILE)
		
	# start the review process.
	reviewer = asreview.ReviewSimulate(
	    as_data,
	    model=train_model,
	    query_model=query_model,
	    balance_model=balance_model,
	    feature_model=feature_model,
	    n_instances=10,
	)
	reviewer.review()
