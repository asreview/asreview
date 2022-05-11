Programming Interface (API)
===========================

For more control over the workings of the ASReview software, an API is
provided. For example, it is possible to define a new model or a sampling
strategy and use it with ASReview.


Simulation Mode
---------------

This example shows how to use the API in simulation mode. `PROJECT_PATH` is 
the path to the project directory. `DATA_FILE` is the path to the data file.
Used in the simulation. `EXPORT_PATH` is the path to the directory where
the results will be exported as a `.asreview` file.	

.. code-block:: python

	from pathlib import Path

	from asreview import ASReviewData
	from asreview.review import ReviewSimulate
	from asreview.project import ASReviewProject

	from asreview.models.classifiers import NaiveBayesClassifier
	from asreview.models.query import MaxQuery
	from asreview.models.balance import SimpleBalance
	from asreview.models.feature_extraction import Tfidf

	# Create a project object and folder
	project = ASReviewProject.create(
		project_path=Path(PROJECT_PATH),
		project_id=None,
		project_mode="simulate",
		project_name=None,
		project_description=None,
		project_authors=None
	)

	# Load the data
	project.add_dataset(DATA_FILE)

	# Select models to use
	train_model = NaiveBayesClassifier()
	query_model = MaxQueryModel()
	balance_model = SimpleBalanceModel()
	feature_model = Tfidf()

	# Initialize the simulation reviewer
	reviewer = ReviewSimulate(
		as_data=            ASReviewData.from_file(project.config['dataset_path']),
		model=              train_model,
		query_model=        query_model,
		balance_model=      balance_model,
		feature_model=      feature_model,
		n_instances=        10,
		state_file=         project,
		n_prior_included=   1,
		n_prior_excluded=   1,
	)

	# Start the review process
	project.update_review(status="review")
	try:
		reviewer.review()
	except Exception as err:
		project.update_review(status="error")
		raise err

	# Finish and export the project
	project.export(EXPORT_PATH)
	project.mark_review_finished()