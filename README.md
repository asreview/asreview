# Automated Systematic Review

*This project is work in progress and **not** production ready.*

Systematic Reviews are “top of the bill” in research. The number of systematic
reviews published by researchers increases year after year. But performing a
sound systematic review is a time-consuming and sometimes boring task. Our
software is designed to take over the step of screening abstracts and titles
with a minimum of papers to be read by a human (in the training set and in the
final included set) and with zero false negatives (or any other small number).

Our Automated Systematic Review (ASR) software implements an oracle and a
simulation systematic review mode.

- **Oracle** The oracle modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer has to
  classify them.
- **Simulate** The simulation modus is used to measure the performance of our
  software on an existing systematic review. The software shows how many
  papers you potentially could have skipped during the systematic review given
  the parameter settings.

This Automatic Systematic Review software is being developed as part of a
research project. This research project consists of multiple repositories. The
following respositories are (or will become) publicly available:

- [automated-systematic-review-datasets](https://github.com/msdslab/automated-systematic-review-datasets) A project for collection, preprocessing and publication of systematic review datasets. The project describes the  data storage format used by the software.
- [automated-systematic-review-simulations](https://github.com/msdslab/automated-systematic-review-simulations) A repository with scripts for a simulation study and scripts for the aggregation and visualisation of the results.
- [automated-systematic-review-benchmarks](https://github.com/msdslab/automated-systematic-review-benchmarks) A repository that is used to compare and benchmark software on systematic reviews.

## Table of Contents

* [Table of Contents](#table-of-contents)
* [Installation](#installation)
* [Quick start](#quick-start)
* [Systematic Review with oracle](#systematic-review-with-oracle)
   * [Command Line Interface (oracle mode)](#command-line-interface-oracle-mode)
   * [Python API (oracle mode)](#python-api-oracle-mode)
* [Systematic Review with labels](#systematic-review-with-labels)
   * [Command Line Interface (simulate mode)](#command-line-interface-simulate-mode)
   * [Python API (simulate mode)](#python-api-simulate-mode)
* [Developement and contributions](#developement-and-contributions)
   * [Entry points](#entry-points)
   * [Debug using pickle dataset](#debug-using-pickle-dataset)
* [Contact and contributors](#contact-and-contributors)


## Installation

The ASR software requires Python 3.6+.

Install the Automated Systematic Review project directly from this github page. 
One can do this with pip and git.

``` bash
pip install git+https://github.com/msdslab/automated-systematic-review.git
```

## Quick start

This quick start describes how you can use the Command Line Interface (CLI)
the Automated Systematic Review (ASR) software. Start an interactive
systematic review (Oracle mode) with the following line in CMD or shell. The
text below the example explain the parameters.

``` sh
asr oracle YOUR_DATA.csv --prior_included 29 181 379 2001 3928 3929 4547 \ 
  --prior_included 31 90 892 3898 3989 4390 --log_file results.log
```

Example:

```
Start review in 'oracle' mode.
Prepare dataset.
Start with the Systematic Review.

Annual research review: The experience of youth with political conflict -
Challenging notions of resilience and encouraging research refinement
Barber, B. K.

Aims and method Drawing on empirical studies and literature reviews, this
paper aims to clarify and qualify the relevance of resilience to youth
experiencing political conflict. It focuses on the discordance between
expectations of widespread dysfunction among conflict-affected youth and a
body of empirical evidence that does not confirm these expectations. Findings
The expectation for widespread dysfunction appears exaggerated, relying as it
does on low correlations and on presumptions of universal response to
adversity. Such a position ignores cultural differences in understanding and
responding to adversity, and in the specific case of political conflict, it
does not account for the critical role of ideologies and meaning systems that
underlie the political conflict and shape a young people's interpretation of
the conflict, and their exposure, participation, and processing of
experiences. With respect to empirical evidence, the findings must be viewed
as tentative given the primitive nature of research designs: namely,
concentration on violence exposure as the primary risk factor, at the expense
of recognizing war's impact on the broader ecology of youth's lives, including
disruptions to key economic, social, and political resources; priority given
to psychopathology in the assessment of youth functioning, rather than
holistic assessments that would include social and institutional functioning
and fit with cultural and normative expectations and transitions; and heavy
reliance on cross-sectional, rather than longitudinal, studies. Conclusions
Researchers and practitioners interested in employing resilience as a guiding
construct will face such questions: Is resilience predicated on evidence of
competent functioning across the breadth of risks associated with political
conflict, across most or all domains of functioning, and/or across time? In
reality, youth resilience amidst political conflict is likely a complex
package of better and poorer functioning that varies over time and in direct
relationship to social, economic, and political opportunities. Addressing this
complexity will complicate the definition of resilience, but it confronts the
ambiguities and limitations of work in cross-cultural contexts. © 2013 The
Authors. Journal of Child Psychology and Psychiatry © 2013 Association for
Child and Adolescent Mental Health.

Include [1] or exclude [0]: 
```

This code (`asr oracle`) runs the software in oracle mode. The dataset
`YOUR_DATA.csv` is the dataset you would like to review in a systematic
review. We use `prior_included` and `prior_excluded` to pass prior knowledge
of the researcher to the model. Use `prior_included` for the indices of papers
that need inclusion and `prior_included` for the indices of papers that need
exclusion. The indices are the row numbers of the articles (starting at 0).
The results are saved to `results.log`.

In simulation modus (`asr simulation`), `YOUR_DATA.csv` contains labels on the
inclusion as well. The CLI for the simulation modus is similar with the oracle
mode.

``` sh
asr simulate YOUR_DATA.csv --prior_included 29 181 379 2001 3928 3929 4547 \ 
  --prior_included 31 90 892 3898 3989 4390 --log_file results.log
```



## Systematic Review with oracle

A systematic review with oracle with an expert.

### Command Line Interface (oracle mode)

Start a review process in the CMD.exe or shell. 

``` bash
asr oracle YOUR_DATA.csv
```

The available parameters are: 

```bash
usage: asr oracle [-h] [-m MODEL] [-q QUERY_STRATEGY]
                  [--n_instances N_INSTANCES] [--n_queries N_QUERIES]
                  [--embedding EMBEDDING]
                  [--prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]]
                  [--prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]]
                  [--log_file LOG_FILE] [--save_model SAVE_MODEL]
                  [--verbose VERBOSE]
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
  --prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]
                        Initial included papers.
  --prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]
                        Initial included papers.
  --log_file LOG_FILE, -l LOG_FILE
                        Location to store the log results.
  --save_model SAVE_MODEL
                        Location to store the model.
  --verbose VERBOSE, -v VERBOSE
                        Verbosity
```

### Python API (oracle mode)

It is possible to create an interactive systematic reviewer with the Python
API. It requires some knowledge on creating an interface. By default, a simple
command line interface is used to interact with the reviewer.

``` python
from asr import load_data, ReviewOracle
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
    optimizer='rmsprop',
    embedding_layer=embedding_matrix
)

# start the review process.
asr = ReviewOracle(
  X,
  model,
  uncertainty_sampling,
  data,
  n_instances=10,
  prior_included=[29, 181, 379, 2001, 3928, 3929, 4547],
  prior_excluded=[31, 90, 892, 3898, 3989, 4390]
)
asr.review()

```



## Systematic Review with labels

A systematic review with the true labels as an expert. This can be useful for
simulating the systematic review process on datasets you reviewed in the past.
The tool can give you an indication of the papers you can exclude from reviewing.

### Command Line Interface (simulate mode)

The CLI for the ASR software in simulation modus is similar to the CLI of the
oracle modus. Instead of `asr oracle`, you use `asr simulate`.

``` bash
asr simulate YOUR_DATA.csv
```

The available parameters are: 

```bash
usage: asr simulate [-h] [-m MODEL] [-q QUERY_STRATEGY]
                    [--n_instances N_INSTANCES] [--n_queries N_QUERIES]
                    [--embedding EMBEDDING]
                    [--prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]]
                    [--prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]]
                    [--n_prior_included [N_PRIOR_INCLUDED [N_PRIOR_INCLUDED ...]]]
                    [--n_prior_excluded [N_PRIOR_EXCLUDED [N_PRIOR_EXCLUDED ...]]]
                    [--log_file LOG_FILE] [--save_model SAVE_MODEL]
                    [--verbose VERBOSE]
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
  --prior_included [PRIOR_INCLUDED [PRIOR_INCLUDED ...]]
                        Initial included papers.
  --prior_excluded [PRIOR_EXCLUDED [PRIOR_EXCLUDED ...]]
                        Initial included papers.
  --n_prior_included [N_PRIOR_INCLUDED [N_PRIOR_INCLUDED ...]]
                        Sample n prior included papers. Only used when
                        --prior_included is not given.
  --n_prior_excluded [N_PRIOR_EXCLUDED [N_PRIOR_EXCLUDED ...]]
                        Sample n prior excluded papers. Only used when
                        --prior_excluded is not given.
  --log_file LOG_FILE, -l LOG_FILE
                        Location to store the log results.
  --save_model SAVE_MODEL
                        Location to store the model.
  --verbose VERBOSE, -v VERBOSE
                        Verbosity
```

### Python API (simulate mode)

It is possible to simulate a systematic review with the Python
API.

``` python
from asr import load_data, ReviewSimulate
from asr.query_strategies import uncertainty_sampling
from asr.utils import text_to_features
from asr.models.embedding import load_embedding, sample_embedding

# load data
data, y = load_data(PATH_TO_DATA)

# create features and labels
X, word_index = text_to_features(data)

# Load embedding layer. 
embedding, words = load_embedding(PATH_TO_EMBEDDING)
embedding_matrix = sample_embedding(embedding, words, word_index)

# create the model
model = create_lstm_model(
    backwards=True,
    optimizer='rmsprop',
    embedding_layer=embedding_matrix
)

# start the review process.
asr = ReviewSimulate(
  X, y,
  model,
  uncertainty_sampling,
  n_instances=10,
  prior_included=[29, 181, 379, 2001, 3928, 3929, 4547],
  prior_excluded=[31, 90, 892, 3898, 3989, 4390]
)
asr.review()

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

### Debug using pickle dataset

Using the ASR software in combination with an embedding layer is
computationally intensive. Subsetting the wikipedia vocabulary is the main
reason for the extensive computational time. This problems results in a large
amount of wasted computational time on the HPC cluster. Therefore, we use
pickle files to speed the initialization up.

Clone the [simulations repository](https://github.com/msdslab/automated-systematic-review-simulations)
next to this repository. Now you can debug code with the code below:

``` sh
python -m asr oracle ../automated-systematic-review-simulations/pickle/ptsd_vandeschoot_words_20000.pkl --n_instances 5
```

### Embedding files

Embedding files contains pretrained model weights. The weights are used as
prior knowledge of the neural network. By default, these weights are stored in
the users `~/asr_data` folder. You can download embedding files with the
following command:

```python
from asr.models.embedding import download_embedding

download_embedding()
```

One can set the environment variable to change the default folder.

```
import os

from asr.models.embedding import download_embedding

# set the environment variable
os.environ['ASR_DATA'] = "~/my_asr_embedding_files"

# download the files
download_embedding()

```


## Publications

- Dutch newspaper NRC on this project ["Software vist de beste artikelen uit een bibliotheek van duizenden."](https://www.nrc.nl/nieuws/2019/01/14/software-vist-de-beste-artikelen-eruit-a3628952)
- News site of Utrecht University: ["A digital tracker dog for datasets"
](https://www.dub.uu.nl/en/depth/digital-tracker-dog-datasets)


## Contact and contributors

This project is part of the research work conducted by the Department of
Methodology & Statistics, Faculty of Social and Behavioral Sciences, Utrecht
University, The Netherlands.

For any questions or remarks, please contact Prof. Dr. Rens van de Schoot
(a.g.j.vandeschoot@uu.nl).

Researchers:

- Rens van de Schoot (a.g.j.vandeschoot@uu.nl, [@Rensvandeschoot](https://github.com/Rensvandeschoot))
- Daniel Oberski (d.l.oberski@uu.nl, [@daob](https://github.com/daob))

Engineers and students:

- Parisa Zahedi (p.zahedi@uu.nl, [@parisa-zahedi](https://github.com/parisa-zahedi))
- Jonathan de Bruin (j.debruin1@uu.nl, [@J535D165](https://github.com/J535D165))
- Raoul Schram (r.d.schram@uu.nl, [@qubixes](https://github.com/qubixes))
- Kees van Eijden (k.vaneijden@uu.nl, [@KvEijden](https://github.com/KvEijden))
- Qixiang Fang ([@fqixiang](https://github.com/fqixiang))
