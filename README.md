# Automated Systematic Review

*This project is work in progress and **not** production ready.*

Systematic Reviews are “top of the bill” in research. The number of systematic
reviews published by researchers increases year after year. But performing a
sound systematic review is a time-consuming and sometimes boring task. Our
software is designed to take over the step of screening abstracts and titles
with a minimum of papers to be read by a human (in the training set and in the
final included set) and with zero false negatives (or any other small number). 

The software implements an oracle and a simulation systematic review mode.

- **Oracle** The oracle modus is an systematic review with interaction 
  with the reviewer (the oracle). When enabled, the reviewer get a new papers 
  presented and has to classify them. 
- **Simulate** The simulation modus can be used to measure the performance of our 
  software on an existing systematic review. The software can show how many
  papers you potentially could have skipped reviewing.


This project consists of multiple repositories. The following respositories are 
publicly available: 

- [automated-systematic-review-datasets](https://github.com/msdslab/automated-systematic-review-datasets) A project for collection, preprocessing and publication of systematic review datasets. The project describes the  data storage format used by software.
- [automated-systematic-review-simulations](https://github.com/msdslab/automated-systematic-review-simulations) A repository with scripts for a simulation study and scripts for the aggregation and/or visualisation of the results.

Table of Contents
=================

   * [Automated Systematic Review](#automated-systematic-review)
      * [Installation](#installation)
      * [Systematic Review with oracle](#systematic-review-with-oracle)
         * [Command Line Interface](#command-line-interface)
         * [Python API](#python-api)
      * [Systematic Review with labels](#systematic-review-with-labels)
         * [Command Line Interface](#command-line-interface-1)
         * [Python API](#python-api-1)
      * [Contact and contributors.](#contact-and-contributors)


## Installation

The Automated Systematic Review project requires Python 3.6+. 

Install the Automated Systematic Review project directly from this github page. 
One can do this with pip and git.

``` bash
pip install git+https://github.com/msdslab/automated-systematic-review.git
```

## Systematic Review with oracle

A systematic review with oracle with an expert.

### Command Line Interface

Start a review process in the CMD.exe or shell. 

``` bash
asr oracle YOUR_DATA.csv
```

The available parameters are: 

```bash
usage: asr oracle [-h] [-m MODEL] [-q QUERY_STRATEGY]
                  [--n_instances N_INSTANCES] [--n_queries N_QUERIES]
                  [--embedding EMBEDDING]
                  [--n_included [N_INCLUDED [N_INCLUDED ...]]]
                  [--n_excluded [N_EXCLUDED [N_EXCLUDED ...]]] [-l LOG_FILE]
                  [--save_model SAVE_MODEL] [-v VERBOSE]
                  X

Systematic review with the help of an oracle.

positional arguments:
  X                     File path to the dataset. The dataset needs to be in
                        the standardised format.

optional arguments:
  -h, --help            show this help message and exit
  -m MODEL, --model MODEL
                        The prediction model for Active Learning. Default
                        'LSTM'.
  -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
                        The query strategy for Active Learning. Default 'lc'.
  --n_instances N_INSTANCES
                        Number of papers queried each query.
  --n_queries N_QUERIES
                        The number of queries. Default None
  --embedding EMBEDDING
                        File path of embedding matrix. Required for LSTM
                        model.
  --n_included [N_INCLUDED [N_INCLUDED ...]]
                        Initial included papers.
  --n_excluded [N_EXCLUDED [N_EXCLUDED ...]]
                        Initial excluded papers.
  -l LOG_FILE, --log_file LOG_FILE
                        Location to store the log results.
  --save_model SAVE_MODEL
                        Location to store the model.
  -v VERBOSE, --verbose VERBOSE
                        Verbosity
```

### Python API

It is possible to create an interactive systematic reviewer with the  Python
API. It requires some knowledge on creating an interface.

``` python
from keras.utils import to_categorical

from asr import load_data, ReviewInteractive
from asr.query_strategies import uncertainty_sampling
from asr.utils import text_to_features
from asr.models.embedding import load_embedding, sample_embedding

# load data
data = load_data(PATH_TO_DATA)

# create features and labels
X, word_index = text_to_features(data)

# Load embedding layer. 
embedding, words = load_embedding(PATH_TO_EMBEDDING)
embedding_matrix = sample_embedding(embedding, words, word_index)

# create the model
model = create_lstm_model(
    backwards=True,
    dropout=0.4,
    optimizer='rmsprop',
    embedding_layer=embedding_matrix
)

# start the review process.
asr = ReviewInteractive(model, uncertainty_sampling)
asr.review(X)

```



## Systematic Review with labels 

A systematic review with an true labels as an expert. This can be useful for
simulating the systematic review process on datasets you reviewed. The tool
can give you an indication of the time and work you can save.

### Command Line Interface

A systematic review with an oracle works in a similar way. Instead of `asr oracle`,
you need `asr simulate`.

``` bash
asr simulate YOUR_DATA.csv
```

The available parameters are: 

```bash
usage: asr simulate [-h] [-m MODEL] [-q QUERY_STRATEGY]
                    [--n_instances N_INSTANCES] [--n_queries N_QUERIES]
                    [--embedding EMBEDDING]
                    [--n_included [N_INCLUDED [N_INCLUDED ...]]]
                    [--n_excluded [N_EXCLUDED [N_EXCLUDED ...]]] [-l LOG_FILE]
                    [--save_model SAVE_MODEL] [-v VERBOSE]
                    X

Systematic review with the help of an oracle.

positional arguments:
  X                     File path to the dataset. The dataset needs to be in
                        the standardised format.

optional arguments:
  -h, --help            show this help message and exit
  -m MODEL, --model MODEL
                        The prediction model for Active Learning. Default
                        'LSTM'.
  -q QUERY_STRATEGY, --query_strategy QUERY_STRATEGY
                        The query strategy for Active Learning. Default 'lc'.
  --n_instances N_INSTANCES
                        Number of papers queried each query.
  --n_queries N_QUERIES
                        The number of queries. Default None
  --embedding EMBEDDING
                        File path of embedding matrix. Required for LSTM
                        model.
  --n_included [N_INCLUDED [N_INCLUDED ...]]
                        Initial included papers.
  --n_excluded [N_EXCLUDED [N_EXCLUDED ...]]
                        Initial excluded papers.
  -l LOG_FILE, --log_file LOG_FILE
                        Location to store the log results.
  --save_model SAVE_MODEL
                        Location to store the model.
  -v VERBOSE, --verbose VERBOSE
                        Verbosity
```

### Python API

It is possible to create an interactive systematic reviewer with the  Python
API. It requires some knowledge on creating an interface.

``` python
from keras.utils import to_categorical

from asr import load_data, ReviewSimulate
from asr.query_strategies import uncertainty_sampling
from asr.utils import text_to_features
from asr.models.embedding import load_embedding, sample_embedding

# load data
data = load_data(PATH_TO_DATA)

# create features and labels
X, word_index = text_to_features(data)

# Load embedding layer. 
embedding, words = load_embedding(PATH_TO_EMBEDDING)
embedding_matrix = sample_embedding(embedding, words, word_index)

# create the model
model = create_lstm_model(
    backwards=True,
    dropout=0.4,
    optimizer='rmsprop',
    embedding_layer=embedding_matrix
)

# start the review process.
asr = ReviewSimulate(model, uncertainty_sampling)
asr.review(X)

```

## Developement and contributions

- Use [yapf]() as formatter for python code. 

### Entry points

Use `python -m asr` to run the module as main. This can be useful when
debugging the CLI and entry_points. 

```
python -m asr oracle yourfile.csv
```
is the same as:
```
asr oracle yourfile.csv
```

### Debug using pickle dataset. 

Clone the simulations repository next to this repository. Now you can debug code with the code below:

``` sh
python -m asr oracle ../automated-systematic-review-simulations/pickle/ptsd_vandeschoot_words_20000.pkl --n_instances 5
```


## Contact and contributors. 

This project is part of the research work conducted by the Department of
Methodology & Statistics, Faculty of Social and Behavioral Sciences, Utrecht
University, The Netherlands.

For any questions or remarks, please contact Prof. Dr. Rens van de Schoot
(a.g.j.vandeschoot@uu.nl).

Contributors: 

- Rens van de Schoot (a.g.j.vandeschoot@uu.nl, @Rensvandeschoot)
- Daniel Oberski (d.l.oberski@uu.nl, @daob)
- Parisa Zahedi (p.zahedi@uu.nl, @parisa-zahedi)
- Jonathan de Bruin (@J535D165)
- Kees van Eijden
- Qixiang Fang
