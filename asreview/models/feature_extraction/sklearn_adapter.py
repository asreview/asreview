# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from asreview.models.feature_extraction.base import BaseFeatureExtraction


class SKLearnAdapter(BaseFeatureExtraction):
    """Adapter for using scikit-learn models in ASReview."""

    def __init__(self, sklearn_model, **kwargs):
        """Create an ASReview feature extractor from a sklearn feature extraction model.

        Parameters
        ----------
        sklearn_model : sklearn feature extraction model class
            The model class should have a `fit` and a `transform` method. Both methods
            should take `Iterable[str]` as input. The `transform` method should produce
            a numpy array or scipy sparse matrix.
        """
        self.model = sklearn_model(**kwargs)

    def fit(self, texts):
        self.model.fit(texts)

    def transform(self, texts):
        return self.model.transform(texts)
