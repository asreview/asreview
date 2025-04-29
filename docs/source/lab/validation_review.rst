Validation reviews
~~~~~~~~~~~~~~~~~~

Validation reviews are tailored for scenarios where it's necessary to validate
existing labels or engage in a review process without being an oracle. This mode
is especially beneficial for validating labels made by a first screener,
reviewing labels returned by an Large Language Models(LLMs) such as ChatGPT, or
for educational and training purposes.

In a validation review, records are presented along with an indication of their previous
labeling status: relevant, irrelevant, or not seen. This status is displayed
via a color-coded bar above each record. If a record was labeled by another
screener or an AI model, you have the opportunity to validate, or challenge
these labels, helping to refine the dataset by correcting any potential
misclassifications, useful for the quality evaluation of the `SAFE procedure <https://www.researchsquare.com/article/rs-2856011/>`_.

Additionally, the validation review is useful for educational use. Instructors
and learners can utilize this mode to simulate the screening process without
being the expert decision-maker. This setup is particularly advantageous in
workshop settings, where participants can engage with the screening process
using the labeled `SYNERGY datasets <https://github.com/asreview/synergy-dataset>`_.
This hands-on experience
offers valuable insights into the software's functionality and the systematic
review process without the need to be a content expert. For comprehensive
online teaching materials and tutorials on using ASReview LAB
effectively, please visit the `ASReview Academy <https://asreview.github.io/asreview-academy/ASReviewLAB.html>`_.

.. figure:: ../../images/project_screening_validation.png
   :alt: ASReview Screening in Validation Mode
