About ASReview
--------------

With the emergence of online publishing, the number of scientific papers and
policy reports on any topic is skyrocketing. Simultaneously, the public press
and social media also produce data by the second. Suppose you are writing a
systematic review or meta-analysis, updating a medical guideline, developing
evidence-based policy, or scouting for new technologies. In that case, you
need to systematically search for potentially relevant documents to provide a
comprehensive overview. To achieve this, you have to search and screen (tens
of) thousands of studies by hand for inclusion. This process is an extremely
imbalanced data problem because truly relevant papers are very sparse.
Moreover, there’s not enough time to read everything in the tsunami of new
knowledge!

Artificial Intelligence (AI) has allowed the development of AI-aided pipelines
that assist in finding relevant texts for search tasks. A well-established
approach to increase the efficiency of title and abstract screening is
screening prioritization via active learning: a constant interaction between a
human (who labels records) and a machine learning model (which selects the
most likely relevant record based on a minimum training dataset). It allows
the screening of large amounts of text in an intelligent and time-efficient
manner. Studies have shown the benefits of active learning, reducing up to 95%
of the required screening time.


A multidisciplinary team has developed and validated open-source software to
support literature research in quickly finding relevant articles: ASReview. 
Part of ASReview is ASReview LAB, free, Libre and open-source software for
screening large amounts of textual data using active learning. The goal of
ASReview is to help scholars and practitioners to get an overview of the most
relevant records for their work as efficiently as possible, while being
transparent in the process. It is uses active learning, allows multiple
ML-models,  and ships with a benchmark mode which is especially useful for
comparing and designing algorithms.  Furthermore, it is intended to be easily
extensible, allowing third parties to add modules that enhance the pipeline
and can process any text (although we consider systematic reviewing as a very
useful approach).


.. figure:: ../../images/FlowChartC.png
   :alt: AI-aided Pipeline
