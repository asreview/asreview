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
from typing import Tuple

from modAL.utils.data import modALinput
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError

from asreview.query_strategies.max_sampling import max_sampling
from sklearn.cluster import KMeans
from asreview.query_strategies.base import BaseQueryStrategy
from asreview.cluster import get_cluster_X


class QueryCluster(BaseQueryStrategy):
    def __init__(self, query_kwargs={}, texts=None, embedding_fp=None):
        super(QueryCluster, self).__init__(query_kwargs)
        self.query_kwargs['cluster_X'] = get_cluster_X(texts, embedding_fp)

    def default_kwargs(self):
        defaults = {
            "cluster_size": 350,
            "update_cluster": 200,
            "max_frac": 0.5
        }
        return defaults

    def hyperopt_space(self):
        from hyperopt import hp
        parameter_space = {
            "qry_cluster_size": hp.quniform('qry_cluster_size', 50, 1000, 1),
            "qry_update_cluster": hp.quniform('qry_update_cluster', 100, 300, 1),
            "qry_max_frac": hp.uniform('qry_max_frac', 0, 1),
        }
        return parameter_space

    @staticmethod
    def function():
        return cluster_sampling

    @staticmethod
    def description():
        return "max sampling on clusters."


def cluster_sampling(classifier: BaseEstimator,
                     X: modALinput,
                     pool_idx=None,
                     n_instances: int = 1,
                     query_kwargs={},
                     **kwargs
                     ) -> Tuple[np.ndarray, modALinput]:
    """
    Combination of random and maximum sampling.
    By default samples the 95% of the instances with max sampling,
    and 5% of the samples with random sampling.

    Parameters
    ----------
    classifier: BaseEstimator
        The classifier for which the labels are to be queried.
    X: modALinput
        The whole input matrix.
    pool_idx: np.array
        Indices of samples that are in the pool.
    n_instances: int
        Total number of samples to be queried.
    extra_vars: dict
        dictionary to pass through settings (such as the max/rand ratio),
        as well as the indices that were obtained using max & random sampling.
    **kwargs:
        Keyword arguments to be passed on to random/max sampling.

    Returns
    -------
    np.ndarray, modALinput
        The indices of the instances from X chosen to be labelled;
        the instances from X chosen to be labelled.
    """

    n_samples = X.shape[0]
    if pool_idx is None:
        pool_idx = np.arange(n_samples)

    target_cluster_size = query_kwargs.get('cluster_size', 350)
    update_cluster = query_kwargs.get('update_cluster', 200)
    max_frac = query_kwargs.get('max_frac', 0.5)

    last_update = query_kwargs.get('cluster_last_update', None)
    if last_update is None or last_update-len(pool_idx) < update_cluster:
        n_clusters = round(len(pool_idx)/target_cluster_size)
        if n_clusters <= 1:
            return max_sampling(classifier, X, pool_idx=pool_idx,
                                n_instances=n_instances,
                                query_kwargs=query_kwargs,
                                **kwargs)
        X = query_kwargs['cluster_X']
        model = KMeans(n_clusters=n_clusters, n_init=1)
        query_kwargs['clusters'] = model.fit_predict(X)
        query_kwargs['cluster_last_update'] = len(pool_idx)

    # First attempt to get the probabilities from the dictionary.
    proba = query_kwargs.get('pred_proba', [])
    if len(proba) != n_samples:
        try:
            proba = classifier.predict_proba(X, **kwargs)
        except NotFittedError:
            proba = np.ones(shape=(n_samples, ))
        query_kwargs['pred_proba'] = proba

    # Get the discrete number of instances for rand/max sampling.
    n_instance_max = floor(n_instances*max_frac)
    if np.random.random_sample() < n_instances*max_frac-n_instance_max:
        n_instance_max += 1
    n_instance_clust = n_instances-n_instance_max

    # Do max sampling.
    max_idx, _ = max_sampling(classifier, X, pool_idx=pool_idx,
                              n_instances=n_instance_max,
                              query_kwargs=query_kwargs,
                              **kwargs)

    # Remove indices found with max sampling from the pool.
    train_idx = np.delete(np.arange(n_samples), pool_idx, axis=0)
    train_idx = np.append(train_idx, max_idx)
    pool_idx = np.delete(np.arange(n_samples), train_idx, axis=0)

    cluster_member = query_kwargs['clusters']
    clusters = {}
    for idx in pool_idx:
        cluster_id = cluster_member[idx]
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
    for idx in clust_idx:
        query_kwargs['current_queries'][idx] = "cluster"
    assert len(clust_idx) == n_instance_clust
    assert len(max_idx) == n_instance_max
    query_idx = np.append(max_idx, clust_idx)
    try:
        return query_idx, X[query_idx]
    except IndexError:
        print(query_idx, len(query_idx))
        raise
