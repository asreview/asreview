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

from math import floor

import numpy as np
from sklearn.cluster import KMeans

from asreview.query_strategies.base import BaseQueryStrategy
from asreview.feature_extraction.doc2vec import Doc2Vec
from asreview.query_strategies.max import MaxQuery


class ClusterQuery(BaseQueryStrategy):
    name = "cluster"
    use_proba = True

    def __init__(self, texts, cluster_size=350, update_cluster=200,
                 max_frac=0.5):
        super(ClusterQuery, self).__init__()
        self.max_frac = max_frac
        self.cluster_size = cluster_size
        self.update_cluster = update_cluster
        feature_model = Doc2Vec()
        self.cluster_X = feature_model.fit_transform(texts)
        self.last_update = None
        self.fallback_model = MaxQuery()

    def _query(self, X, pool_idx, n_instances, proba):
        n_samples = X.shape[0]
        if pool_idx is None:
            pool_idx = np.arange(n_samples)

        last_update = self.last_update
        if last_update is None or last_update-len(pool_idx) < self.update_cluster:
            n_clusters = round(len(pool_idx)/self.cluster_size)
            if n_clusters <= 1:
                return self.fallback_model()._query(
                    X, pool_idx=pool_idx,
                    n_instances=n_instances,
                    proba=proba)
            model = KMeans(n_clusters=n_clusters, n_init=1)
            self.clusters = model.fit_predict(X)
            self.last_update = len(pool_idx)

        # Get the discrete number of instances for rand/max sampling.
        n_instance_max = floor(n_instances*self.max_frac)
        if np.random.random_sample() < n_instances*self.max_frac-n_instance_max:
            n_instance_max += 1
        n_instance_clust = n_instances-n_instance_max

        # Do max sampling.
        max_idx, _ = self.fallback_model()._query(
            X, pool_idx=pool_idx, n_instances=n_instance_max, proba=proba)

        # Remove indices found with max sampling from the pool.
        train_idx = np.delete(np.arange(n_samples), pool_idx, axis=0)
        train_idx = np.append(train_idx, max_idx)
        pool_idx = np.delete(np.arange(n_samples), train_idx, axis=0)

        clusters = {}
        for idx in pool_idx:
            cluster_id = self.clusters[idx]
            if cluster_id in clusters:
                clusters[cluster_id].append((idx, proba[idx, 1]))
            else:
                clusters[cluster_id] = [(idx, proba[idx, 1])]

        for cluster_id in clusters:
            try:
                clusters[cluster_id] = sorted(clusters[cluster_id], key=lambda x: x[1])
            except ValueError:
                raise

        clust_idx = []
        cluster_ids = list(clusters)
        for _ in range(n_instance_clust):
            cluster_id = np.random.choice(cluster_ids, 1)[0]
            clust_idx.append(clusters[cluster_id].pop()[0])
            if len(clusters[cluster_id]) == 0:
                del clusters[cluster_id]
                cluster_ids = list(clusters)

        clust_idx = np.array(clust_idx)
        assert len(clust_idx) == n_instance_clust
        assert len(max_idx) == n_instance_max
        query_idx = np.append(max_idx, clust_idx)

        return query_idx, X[query_idx]

    def hyperopt_space(self):
        from hyperopt import hp
        parameter_space = {
            "qry_cluster_size": hp.quniform('qry_cluster_size', 50, 1000, 1),
            "qry_update_cluster": hp.quniform('qry_update_cluster', 100, 300, 1),
            "qry_max_frac": hp.uniform('qry_max_frac', 0, 1),
        }
        return parameter_space
