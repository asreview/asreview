# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

from copy import deepcopy
from multiprocessing import Queue
from multiprocessing import cpu_count
from multiprocessing import Process
from pathlib import Path
import queue

import numpy as np

from asreview.review.factory import review_simulate


def _sim_worker(job_queue):
    while True:
        try:
            job = job_queue.get(block=False)
        except queue.Empty:
            return

        args = job["args"]
        kwargs = job["kwargs"]

        review_simulate(*args, **kwargs)


def batch_simulate(*args, n_jobs=-1, **kwargs):
    if n_jobs is None:
        n_jobs = 1
    elif n_jobs == -1:
        n_jobs = cpu_count()

    new_jobs = create_jobs(*args, **kwargs)
    job_queue = Queue()
    for job in new_jobs:
        job_queue.put(job)

    worker_procs = [
        Process(
            target=_sim_worker,
            args=(job_queue,),
            daemon=True,
        )
        for _ in range(n_jobs)
    ]

    for proc in worker_procs:
        proc.start()

    for proc in worker_procs:
        proc.join()


def create_jobs(*args, **kwargs):
    n_runs = kwargs.pop("n_run")
    state_file = kwargs.pop("state_file", None)
    if state_file is None:
        state_file = kwargs.pop("log_file")
    init_seed = kwargs.pop("init_seed", None)
    r = np.random.RandomState(init_seed)

    Path(state_file).parent.mkdir(exist_ok=True)
    jobs = []
    for i in range(n_runs):
        suffix = Path(state_file).suffix
        stem = Path(state_file).stem
        state_dir = Path(state_file).parent
        new_state_file = Path(state_dir, f"{stem}_{i}{suffix}")
        new_kwargs = deepcopy(kwargs)
        if init_seed is not None:
            new_kwargs["init_seed"] = r.randint(0, 99999999)
        new_kwargs["state_file"] = new_state_file
        jobs.append({
            "args": deepcopy(args),
            "kwargs": new_kwargs,
        })
    return jobs
