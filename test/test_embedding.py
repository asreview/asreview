import string
import random
import os
import urllib.request

from asreview.feature_extraction.embedding_lstm import load_embedding
from asreview.feature_extraction.embedding_lstm import sample_embedding


def random_words(n_words=1000, other_word_dict={}):
    """ Generator of random (ascii) words.

    Parameters
    ----------
    n_words: int
        Number of words to generate

    Returns
    -------

    str:
        List of words
    """

    word_dict = {}
    i = 0
    # Generate words until we have enough.
    while len(word_dict) < n_words:
        n_letters = random.randint(1, 10)
        new_word = ""
        for _ in range(n_letters):
            new_word += random.choice(string.ascii_letters)
        if new_word not in word_dict and new_word not in other_word_dict:
            word_dict[new_word] = i
            i += 1
    return list(word_dict)


def random_sample_embedding(words, n_samples=200):
    """ Generator of sampled embeddings.

    Parameters
    ----------
    words: str
        List of words to sample from; len(words) >= n_samples.
    n_samples: int
        Number of samples to take

    Returns
    -------
    dict:
        Dictionary containing sampled words as keys and order as values.
    """

    assert len(words) >= n_samples
    keys = random.sample(words, n_samples)
    order = random.sample(range(1, n_samples+1), n_samples)
    for i in range(1, n_samples+1):
        assert i in order
    word_index = dict(zip(keys, order))
    assert len(keys) == n_samples
    assert len(order) == n_samples
    print(keys)
    print(order)
    print(words)
    assert len(word_index) == n_samples
    return word_index


def random_embedding(words, emb_vec_dim=300):
    """ Generator of random embedding.

    Parameters
    ----------
    words: str
        List of words to generate embedding for.
    emb_vec_dim: int
       Dimension of embedding vectors.

    Returns
    -------
    dict:
        Random embedding dictionary for all input words.
    """
    full_embedding = {}
    for word in words:
        new_rand = [random.random() for _ in range(emb_vec_dim)]
        full_embedding[word] = new_rand
    return full_embedding


def write_random_embedding(full_embedding, tmpfile):
    """ Write an embedding to a file.

    Parameters
    ----------
    tmpfile: str
        Temporary file created by pytest.
    full_embedding: dict
        Embedding without sampling.
    """

    n_words = len(full_embedding)
    emb_vec_dim = len(full_embedding[list(full_embedding)[0]])
    with open(tmpfile, "w") as f:
        f.write(f"{n_words} {emb_vec_dim}\n")
        for word in list(full_embedding):
            f.write(word+" ")
            new_rand_str = [str(x) for x in full_embedding[word]]
            # Add extra space at the end of the line for compatibility.
            f.write(" ".join(new_rand_str)+" \n")


def check_embedding(emb, full_embedding, n_samples, emb_vec_dim):
    """ Do the checking for the loaded embedding.

    Parameters
    ----------
    emb: dict
        Embedding read from a file, potentially subsampled.
    full_embedding: dict
        Embedding as created in the unit test directly.
    n_samples: int
        Number of samples taken, if not sampled n_samples == n_words.
    emb_vec_dim: int
        Dimension of the embedding vectors.
    """
    assert len(emb) == n_samples
    for key in emb:
        assert emb[key].size == emb_vec_dim
        for i in range(emb[key].size):
            assert abs(emb[key][i] - full_embedding[key][i]) < 1e-5
    assert isinstance(emb, (dict,))


def test_load_embedding(tmpdir):
    """ Unit test for load_embedding function. """
    n_words = 100
    n_samples = 30
    emb_vec_dim = 133

    # Generate embedding.
    words = random_words(n_words)
    word_index = random_sample_embedding(words, n_samples)
    tmpfile = os.path.join(tmpdir, "emb.dat")
    full_embedding = random_embedding(words, emb_vec_dim)

    write_random_embedding(full_embedding, tmpfile)

    # Test with one worker process, no sampling.
    emb1 = load_embedding(tmpfile, word_index=None, n_jobs=1)
    check_embedding(emb1, full_embedding, n_words, emb_vec_dim)

    # Test with all cores, sampling.
    emb2 = load_embedding(tmpfile, word_index, n_jobs=-1)
    check_embedding(emb2, full_embedding, n_samples, emb_vec_dim)

    # Test with 3+1 cores, sampling.
    emb3 = load_embedding(tmpfile, word_index, n_jobs=3)
    check_embedding(emb3, full_embedding, n_samples, emb_vec_dim)


def test_sample_embedding():
    """ Unit test for sample_embedding """
    n_words = 50
    n_samples = 55
    emb_vec_dim = 133
    emb_extra = 10

    # Generate embedding.
    words = random_words(n_words)
    all_words = random_words(emb_extra, words) + words
    word_index = random_sample_embedding(all_words, n_samples)
    full_embedding = random_embedding(words, emb_vec_dim)
    emb_matrix = sample_embedding(full_embedding, word_index)

    assert emb_matrix.shape == (n_samples+1, emb_vec_dim)
    for key in word_index:
        i_row = word_index[key]
        if key in words:
            for i in range(emb_vec_dim):
                assert emb_matrix[i_row][i] == full_embedding[key][i]
            for i in range(emb_vec_dim, emb_vec_dim):
                assert emb_matrix[i_row][i] == 0


def test_embedding_link():
    """ Test if wikipedia embedding still exists. """
    url = "https://dl.fbaipublicfiles.com" \
          "/fasttext/vectors-crawl/cc.en.300.vec.gz"
    assert urllib.request.urlopen(url).getcode() == 200
