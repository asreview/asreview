# Cpython dependencies

# external dependencies
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences


def load_data(fp):
    """Load papers and their labels.

    Arguments
    ---------
    fp: str
        File path to the data.

    Returns
    -------
    np.ndarray, np.array
        The title and abstract merged into a single string for each paper.
        The labels for each paper. 1 is included, 0 is excluded. If this column
        is not available, this column is not returned.
    """

    df = pd.read_csv(fp)

    # make texts and labels
    texts = (df['title'].fillna('') + ' ' + df['abstract'].fillna(''))

    try:
        labels = df["included_final"]
    except KeyError:
        return texts.values

    return texts.values, labels.values


def text_to_features(sequences, num_words=20000, max_sequence_length=1000,
                     padding='post', truncating='post'):
    """Convert text data into features.

    Arguments
    ---------
    sequences: list, numpy.ndarray, pandas.Series
        The sequences to convert into features.
    num_words: int
        See keras Tokenizer

    Returns
    -------
    np.ndarray, dict
        The array with features and the dictiory that maps words to values.
    """

    # fit on texts
    tokenizer = Tokenizer(num_words=num_words)
    tokenizer.fit_on_texts(sequences)

    # tokenize sequences
    tokens = tokenizer.texts_to_sequences(sequences)

    # pad sequences with zeros.
    x = pad_sequences(
        tokens,
        maxlen=max_sequence_length,
        padding=padding,
        truncating=truncating
    )

    # word index hack. see issue
    # https://github.com/keras-team/keras/issues/8092
    word_index = {e: i for e, i in tokenizer.word_index.items()
                  if i <= num_words}

    return x, word_index


def split_data(data, labels, train_size, init_positives):
    """split dataset to train and test datasets
    """
    if train_size >= len(data):
        print('invalid train size')
        return

    print('shape(data)', data.shape)
    print('shape(labels)', labels.shape)

    # select init_positive cases from the entire dataset
    if init_positives > 0:
        # index of all included papers in the entire dataset
        positive_indx = np.where(labels[:, 1] == 1)[0]

        # np.random.seed(seed)

        to_add_indx = np.random.choice(
            positive_indx, init_positives, replace=False)

        y_train_init = labels[to_add_indx]
        x_train_init = data[to_add_indx]

        indices_without_init = [
            idx for idx, val in enumerate(labels) if idx not in to_add_indx
        ]

    train_size = train_size - init_positives
    validation_split = 1 - (train_size / len(data[indices_without_init])
                            )  # ratio of selecting test dataset

    print('train_size', train_size)
    print('len(data)', len(data[indices_without_init]))
    print('len(indices_without_init)', len(indices_without_init))
    # split data into train and test
    x_train, x_val, y_train, y_val, indices_train, indices_test = train_test_split(
        data[indices_without_init],
        labels[indices_without_init],
        indices_without_init,
        test_size=validation_split
        # random_state=seed
        # stratify=labels
    )

    # add initially selected papers to train dataset
    x_train = np.vstack((x_train, x_train_init))
    y_train = np.vstack((y_train, y_train_init))

    print('to_add_indx', type(to_add_indx))
    print('indices_train', type(indices_train))

    indices_train = to_add_indx.tolist() + indices_train
    return (x_train, x_val, y_train, y_val, indices_train, indices_test)


def split_data_iterative_sr(data, labels, train_index, test_index):
    """split dataset to train and test datasets.
    """

    x_train = data[train_index]
    x_val = data[test_index]
    y_train = labels[train_index]
    y_val = labels[test_index]

    return (x_train, x_val, y_train, y_val)
