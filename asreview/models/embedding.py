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

import gzip
import io
import logging
from multiprocessing import cpu_count
from multiprocessing import Process
from multiprocessing import Queue
from pathlib import Path
from urllib.request import urlopen

import numpy as np

from asreview.utils import get_data_home


EMBEDDING_EN = {
    "url": "https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.en.300.vec.gz",  # noqa
    "name": 'fasttext.cc.en.300.vec'
}


def _embedding_reader(filename, input_queue, block_size=1000):
    """ Process that reads the word embeddings from a file.

    Parameters
    ----------
    filename: str
        File of trained embedding vectors.
    input_queue: Queue
        Queue to store jobs in.
    block_size: int
        Number of lines for each job.
    """

    with open(filename, 'r', encoding='utf-8', newline='\n') as f:
        # Throw away the first line, since we don't care about the dimensions.
        f.readline()

        i_line = 0
        buffer = []
        # Read the embedding file line by line.
        for line in f:
            i_line += 1
            buffer.append(line)
            # If the buffer is full, write it to the queue.
            if i_line == block_size:
                input_queue.put(buffer)
                i_line = 0
                buffer = []
        if i_line > 0:
            input_queue.put(buffer)

    # Put the string "DONE" in the queue, to ensure that the
    # worker processes finish.

    input_queue.put("DONE")


def _embedding_worker(input_queue, output_queue, emb_vec_dim, word_index=None):
    """ Process that reads the word embeddings from a file.

    Parameters
    ----------
    input_queue: Queue
        Queue in which the jobs are submitted.
    output_queue: Queue
        Queue to store the embedding in dictionary form.
    emb_vec_dim: int
        Dimension of each embedding vector.
    word_index: dict
        Dictionary of the sample embedding.
    """

    bad_input = False
    bad_values = {}
    while True:
        embedding = {}
        buffer = input_queue.get()
        if buffer == "DONE":
            break

        for line in buffer:
            line = line.rstrip()
            values = line.split(' ')

            if len(values) != emb_vec_dim + 1:
                if not bad_input:
                    print("Error: bad input in embedding vector.")
                bad_input = True
                bad_values = values
                break

            word = values[0]
            if word_index is not None and word not in word_index:
                continue
            coefs = values[1:emb_vec_dim + 1]

            # store the results
            embedding[word] = np.asarray(coefs, dtype=np.float32)
        output_queue.put(embedding)

    # We removed the "DONE" from the input queue, so put it back in for
    # the other processes.
    input_queue.put("DONE")

    # Store the results in the output queue
    if bad_input:
        output_queue.put({"ErrorBadInputValues": bad_values})
    output_queue.put("DONE")


def _embedding_aggregator(output_queue, n_worker):
    """ Process that aggregates the results of the workers.
        This should be the main/original process.

    Parameters
    ----------
    output_queue: Queue
        This queue is the output queue of the workers.
    n_worker: int
        The number of worker processes.

    Returns
    -------
    Aggregated embedding dictionary.
    """

    embedding = {}

    num_done = 0
    while num_done < n_worker:
        new_embedding = output_queue.get()
        if new_embedding == "DONE":
            num_done += 1
        else:
            embedding.update(new_embedding)

    return embedding


def download_embedding(url=EMBEDDING_EN['url'], name=EMBEDDING_EN['name'],
                       data_home=None):
    """Download word embedding file.

    Download word embedding file, unzip the file and save to the
    file system.

    Parameters
    ----------
    url: str
        The URL of the gzipped word embedding file
    name: str
        The filename of the embedding file.
    data_home: str
        The location of the ASR datasets.
        Default `asreview.utils.get_data_home()`

    """

    if data_home is None:
        data_home = get_data_home()

    out_fp = Path(data_home, name)

    logging.info(f'Start downloading: {url}')

    r = urlopen(url)
    compressed_file = io.BytesIO(r.read())

    logging.info(f'Save embedding to {out_fp}')

    decompressed_file = gzip.GzipFile(fileobj=compressed_file)

    with open(out_fp, 'wb') as out_file:
        for line in decompressed_file:
            out_file.write(line)


def load_embedding(fp, word_index=None, n_jobs=None):
    """Load embedding matrix from file.

    The embedding matrix needs to be stored in the
    FastText format.

    Parameters
    ----------
    fp: str
        File path of the trained embedding vectors.
    word_index: dict
        Sample word embeddings.
    n_jobs: int
        Number of processes to parse the embedding (+1 process for reading).
    verbose: int
        The verbosity. Default 1.


    Returns
    -------
    dict:
        The embedding weights stored in a dict with the word as key and
        the weights as values.
    """

    # Maximum number of jobs in the queue.
    queue_size = 500

    # Set the number of reader processes to use.
    if n_jobs is None:
        n_jobs = 1
    elif n_jobs == -1:
        n_jobs = cpu_count()-1

    input_queue = Queue(queue_size)
    output_queue = Queue()

    with open(fp, 'r', encoding='utf-8', newline='\n') as f:
        n_words, emb_vec_dim = list(map(int, f.readline().split(' ')))

    logging.debug(
        f"Reading {n_words} vectors with {emb_vec_dim} dimensions."
    )

    worker_procs = []
    p = Process(target=_embedding_reader, args=(fp, input_queue),
                daemon=True)
    worker_procs.append(p)
    for _ in range(n_jobs):
        p = Process(
            target=_embedding_worker,
            args=(input_queue, output_queue, emb_vec_dim, word_index),
            daemon=True)
        worker_procs.append(p)

    # Start workers.
    for proc in worker_procs:
        proc.start()
    embedding = _embedding_aggregator(output_queue, n_jobs)

    # Merge dictionaries of workers

    # Join workers
    for proc in worker_procs:
        proc.join()

    if "ErrorBadInputValues" in embedding:
        bad_values = embedding["ErrorBadInputValues"]
        raise ValueError(f"Check embedding matrix, bad format: {bad_values}")

    logging.debug(f"Found {len(embedding)} word vectors.")

    return embedding


def sample_embedding(embedding, word_index):
    """Sample embedding matrix

    Parameters
    ----------
    embedding: dict
        A dictionary with the words and embedding vectors.
    word_index: dict
        A word_index like the output of Keras Tokenizer.word_index.
    verbose: int
        The verbosity. Default 1.

    Returns
    -------
    (np.ndarray, list):
        The embedding weights strored in a two dimensional
        numpy array and a list with the corresponding words.
    """

    n_words, emb_vec_dim = len(word_index), len(next(iter(embedding.values())))

    logging.debug(f"Creating matrix with {n_words} vectors "
                  f"with dimension {emb_vec_dim}.")

    # n+1 because 0 is preserved in the tokenizing process.
    embedding_matrix = np.zeros((n_words + 1, emb_vec_dim))

    for word, i in word_index.items():
        coefs = embedding.get(word)
        if coefs is not None:
            embedding_matrix[i] = coefs
    logging.debug(f'Shape of embedding matrix: {embedding_matrix.shape}')

    return embedding_matrix
