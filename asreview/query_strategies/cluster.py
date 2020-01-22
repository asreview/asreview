# Copyright 2019 The ASReview Authors. All Rights Reserved.
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

import numpy as np
from sklearn.cluster import KMeans

from asreview.query_strategies.base import ProbaQueryStrategy
from asreview.feature_extraction.doc2vec import Doc2Vec
from asreview.query_strategies.max import MaxQuery


class ClusterQuery(ProbaQueryStrategy):
    name = "cluster"

    def __init__(self, texts, cluster_size=350, update_interval=200, **kwargs):
        """Initialize the clustering strategy.

        Arguments
        ---------
        texts: list
            List of sequences to create feature matrix.
        cluster_size: int
            Size of the clusters to be made. If the size of the clusters is
            smaller than the size of the pool, fall back to max sampling.
        update_cluster: int
            Update the clustering every x instances.
        **kwargs: dict
            Keyword arguments for the doc2vec feature model.
        """
        super(ClusterQuery, self).__init__()
        self.cluster_size = cluster_size
        self.update_interval = update_interval
        feature_model = Doc2Vec(**kwargs)
        self.cluster_X = feature_model.fit_transform(texts)
        self.last_update = None
        self.fallback_model = MaxQuery()

    def _query(self, X, pool_idx, n_instances, proba):
        n_samples = X.shape[0]
        if pool_idx is None:
            pool_idx = np.arange(n_samples)

        last_update = self.last_update
        if (last_update is None or self.update_interval is None or
                last_update-len(pool_idx) >= self.update_interval):
            n_clusters = round(len(pool_idx)/self.cluster_size)
            if n_clusters <= 1:
                return self.fallback_model()._query(
                    X, pool_idx=pool_idx,
                    n_instances=n_instances,
                    proba=proba)
            model = KMeans(n_clusters=n_clusters, n_init=1)
            self.clusters = model.fit_predict(X)
            self.last_update = len(pool_idx)

        clusters = {}
        for idx in pool_idx:
            cluster_id = self.clusters[idx]
            if cluster_id in clusters:
                clusters[cluster_id].append((idx, proba[idx, 1]))
            else:
                clusters[cluster_id] = [(idx, proba[idx, 1])]

        for cluster_id in clusters:
            try:
                clusters[cluster_id] = sorted(
                    clusters[cluster_id], key=lambda x: x[1])
            except ValueError:
                raise

        clust_idx = []
        cluster_ids = list(clusters)
        for _ in range(n_instances):
            cluster_id = np.random.choice(cluster_ids, 1)[0]
            clust_idx.append(clusters[cluster_id].pop()[0])
            if len(clusters[cluster_id]) == 0:
                del clusters[cluster_id]
                cluster_ids = list(clusters)

        clust_idx = np.array(clust_idx, dtype=int)

        return clust_idx, X[clust_idx]

    def full_hyper_space(self):
        from hyperopt import hp
        parameter_space = {
            "qry_cluster_size": hp.quniform('qry_cluster_size', 50, 1000, 1),
            "qry_update_cluster": hp.quniform(
                'qry_update_cluster', 100, 300, 1),
            "qry_max_frac": hp.uniform('qry_max_frac', 0, 1),
        }
        return parameter_space, {}
