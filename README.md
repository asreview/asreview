# Automated Systematic Review

[![Build Status](https://travis-ci.com/msdslab/automated-systematic-review.svg?branch=master)](https://travis-ci.com/msdslab/automated-systematic-review) [![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest)


--- 

*This project is work in progress and **not** production ready.*

---

Systematic Reviews are “top of the bill” in research. The number of systematic
reviews published by researchers increases year after year. But performing a
sound systematic review is a time-consuming and sometimes boring task. Our
software is designed to accelerate the step of screening abstracts and titles
with a minimum of papers to be read by a human with no or very few false negatives.

Our Automated Systematic Review (ASR) software implements an oracle and a
simulation mode.

- **Oracle** The oracle modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer classifies them.
- **Simulate** The simulation modus is used to measure the performance of our
  software on existing systematic reviews. The software shows how many
  papers you could have potentially skipped during the systematic review.

The full documentation is available at [https://asreview.readthedocs.io](https://asreview.readthedocs.io)

This Automatic Systematic Review software is being developed as part of a
research project. This research project consists of multiple repositories. The
following respositories are (or will become) publicly available:

- [automated-systematic-review-datasets](https://github.com/msdslab/automated-systematic-review-datasets) A project for collection, preprocessing and publication of systematic review datasets. The project describes the  data storage format used by the software.
- [automated-systematic-review-simulations](https://github.com/msdslab/automated-systematic-review-simulations) A repository with scripts for a simulation study and scripts for the aggregation and visualisation of the results.
- [automated-systematic-review-benchmarks](https://github.com/msdslab/automated-systematic-review-benchmarks) A repository that is used to compare and benchmark software on systematic reviews.

## Table of Contents

* [Table of Contents](#table-of-contents)
* [Active Learning for reviewing papers](#active-learning-for-reviewing-papers)
* [Installation](#installation)
* [Quick start](#quick-start)
* [Tech](#tech)
* [Datasets](#datasets)
* [Development and contributions](#development-and-contributions)
   * [Entry points](#entry-points)
   * [Debug using pickle dataset](#debug-using-pickle-dataset)
* [Contact and contributors](#contact-and-contributors)

## Active Learning for reviewing papers

The ASR project implements learning algorithms that interactively query the
researcher. This way of interactive training is known as
[Active Learning](https://en.wikipedia.org/wiki/Active_learning_(machine_learning)).
The ASR software offers support for classical learning algorithms and
state-of-the-art learning algorithms like neural networks. The following image
gives an overview of the process.

![Active Learning for reviewing papers](https://github.com/msdslab/automated-systematic-review/blob/master/images/deepreview.png?raw=true)


## Installation

The ASR software requires Python 3.6+. The project is available on Pypi. Install the 
project with:

```bash 
pip install asreview
```

Install the development version of the Automated Systematic Review project directly 
from this Github page. One can do this with pip and git.

``` bash
pip install git+https://github.com/msdslab/automated-systematic-review.git
```

## Quick start

The quickest way to start using the Automated Systematic Review (ASR) software is
the Command Line Interface (CLI). 
Start an interactive systematic review (Oracle mode) with the following line in CMD or shell:

``` sh
asreview oracle YOUR_DATA.csv --prior_included 29 181 379 2001 3928 3929 4547 \ 
  --prior_included 31 90 892 3898 3989 4390 --log_file results.log
```

Example output:

```
Start review in 'oracle' mode.
Prepare dataset.
Start with the Systematic Review.

Annual research review: The experience of youth with political conflict -
Challenging notions of resilience and encouraging research refinement
Barber, B. K.

Aims and method Drawing on empirical studies and literature reviews, this
paper aims to clarify and qualify the relevance of resilience to youth
...
Authors. Journal of Child Psychology and Psychiatry © 2013 Association for
Child and Adolescent Mental Health.

Include [1] or exclude [0]:
```

This command (`asreview oracle`) runs the software in oracle mode on the 
`YOUR_DATA.csv` dataset. Passing `prior_included` signifies the paper IDs
that should definitely be included, while `prior_excluded` are IDs of papers
that are definitely excluded. The higher the number of included/excluded papers,
the quicker the ASR software will understand your choices for inclusion.
The IDs are the idententifiers of papers, starting from
0 for the first paper found in the dataset.

To benchmark an already executed review, use the simulation modus (`asreview simulation`).
The dataset then needs an additional column ("label_included") to signify their inclusion
in the final review. The command for the simulation modus is similar to the oracle
mode:

``` sh
asreview simulate YOUR_DATA.csv --prior_included 29 181 379 2001 3928 3929 4547 \ 
  --prior_included 31 90 892 3898 3989 4390 --log_file results.log
```

## Tech

There are many different [models](asreview/models/README.md), [query strategies](asreview/query_strategies/README.md),
and [rebalancing strategies](asreview/balance_strategies/README.md) available. 
A LSTM neural network based model is currently the best performing and optimized. 
By default, the ASR software will use models tuned on datasets available to us.
Tuning of models, query strategies and rebalanceing strategies is possible either
through the CLI or the API.

## Datasets

The ASR software accepts datasets in the RIS and CSV file format. [RIS
files](https://en.wikipedia.org/wiki/RIS_(file_format)) are used by digital
libraries, such as IEEE Xplore, Scopus and ScienceDirect. Citation managers
Mendeley and EndNote support the RIS format as well. For simulation, we use an
additional RIS tag with the letters `LI`. For CSV files, the software accepts
a set of predetermined labels in line with the ones used in RIS files. Please
see the project [Automatic Systematic Review
Datasets](https://github.com/msdslab/automated-systematic-review-datasets) for
the complete standard.

## Development and contributions

- Use [yapf](https://github.com/google/yapf) as formatter for python code. 

### Entry points

Use `python -m asreview` to run the module as main. This can be useful when
debugging the CLI and entry_points. 

```
python -m asreview oracle yourfile.csv
```

is the same as:

```
asreview oracle yourfile.csv
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
python -m asreview oracle ../automated-systematic-review-simulations/pickle/ptsd_vandeschoot_words_20000.pkl --n_instances 5
```

### Embedding files

Embedding files contains pretrained model weights. The weights are used as
prior knowledge of the neural network. By default, these weights are stored in
the users `~/asr_data` folder. You can download embedding files with the
following command:

```python
from asreview.models.embedding import download_embedding

download_embedding()
```

One can set the environment variable to change the default folder.

```
import os

from asreview.models.embedding import download_embedding

# set the environment variable
os.environ['ASR_DATA'] = "~/my_asr_embedding_files"

# download the files
download_embedding()

```

## Publications

- Dutch newspaper NRC on this project ["Software vist de beste artikelen uit een bibliotheek van duizenden."](https://www.nrc.nl/nieuws/2019/01/14/software-vist-de-beste-artikelen-eruit-a3628952)
- News site of Utrecht University: ["A digital tracker dog for datasets"
](https://www.dub.uu.nl/en/depth/digital-tracker-dog-datasets)


## Citation

A research paper is coming up for this project. In the mean time, it can be cited with (fill in x and y for the version number):

```
ASReview Core Development Team (2019). ASReview: Software for automated systematic reviews [version 0.x.y]. Utrecht University, Utrecht, The Netherlands. Available at https://github.com/msdslab/automated-systematic-review.
```

BibTeX:

```bibtex
@Manual{,
    title = {ASReview: Software for automated systematic reviews},
    author = {{ASReview Core Development Team}},
    organization = {Utrecht University},
    address = {Utrecht, The Netherlands},
    year = 2019,
    url = {https://pypi.org/project/asreview/}
} 
```


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
- Albert Harkema (a.d.harkema@uu.nl, [@sasafrass](https://github.com/sasafrass))
