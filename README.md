# Automated Systematic Review

[![Build Status](https://travis-ci.com/msdslab/automated-systematic-review.svg?branch=master)](https://travis-ci.com/msdslab/automated-systematic-review) [![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg)](https://doi.org/10.5281/zenodo.3345592)



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

Our tutorial ["10 Minutes into ASReview"](https://asreview.readthedocs.io/en/latest/10minutes_asreview.html) is an introduction into ASReview for new users. The full documentation is available at [https://asreview.readthedocs.io](https://asreview.readthedocs.io)

This Automatic Systematic Review software is being developed as part of a
research project. This research project consists of multiple repositories. The
following respositories are (or will become) publicly available:

- [automated-systematic-review-datasets](https://github.com/msdslab/automated-systematic-review-datasets) A project for collection, preprocessing and publication of systematic review datasets. The project describes the  data storage format used by the software.
- [automated-systematic-review-simulations](https://github.com/msdslab/automated-systematic-review-simulations) A repository with scripts for a simulation study and scripts for the aggregation and visualisation of the results.


## Table of Contents

* [Automated Systematic Review](#automated-systematic-review)
* [Table of Contents](#table-of-contents)
* [Active Learning for reviewing papers](#active-learning-for-reviewing-papers)
* [Installation](#installation)
* [Quick start](#quick-start)
* [Tech](#tech)
* [Datasets](#datasets)
* [Frequently Asked Questions](#frequently-asked-questions)
* [Publications](#publications)
* [Citation](#citation)
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
asreview oracle YOUR_DATA.csv --log_file results.json
```

![](docs/gifs/asreview-intro.gif)

This command (`asreview oracle`) runs the software in oracle mode on the 
`YOUR_DATA.csv` dataset. 

The higher the number of papers that you manually include in ASReview,
the quicker the ASR software will understand your choices for inclusion.
The IDs are the identifiers of papers, starting from
0 for the first paper found in the dataset.

To benchmark an already executed review, use the simulation modus (`asreview simulation`).
The dataset then needs an additional column ("label_included") to signify their inclusion
in the final review. The command for the simulation modus is similar to the oracle
mode:

``` sh
asreview simulate YOUR_DATA.csv --n_prior_included 5 --n_prior_excluded 5 --log_file results.h5
```

## Tech

There are many different [models](https://asreview.readthedocs.io/en/latest/models.html), [query strategies](https://asreview.readthedocs.io/en/latest/query_strategies.html),
and [rebalancing strategies](https://asreview.readthedocs.io/en/latest/balance_strategies.html) available.
Currently, the best performing and optimized model is a Naive Bayes model; by default this model is used.

Hyperparameters of models, query strategies and rebalancing strategies is possible through supplying a configuration file.

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

## Frequently Asked Questions

### Unknown command "asreview" on command line or terminal

In some situations, the entry point "asreview" can not be found after
installation. First check whether the package is correctly installed. Do this
with the command `python -m asreview -h`. If this shows a decription of the
program, please use `python -m` in front of all your commands. For example 

```
python -m asreview oracle yourfile.csv
```

### How do I work with the Command Line?

MacOS and Linux users can learn about bash on the website
[programminghistorian.org](https://programminghistorian.org/en/lessons/intro-to-bash).
Windows users may also follow this tutorial, but might prefer a tutorial on
`cmd.exe`.

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

This project is part of the research work conducted by the [Department of
Methodology & Statistics](https://www.uu.nl/en/organisation/faculty-of-social-and-behavioural-sciences/about-the-faculty/departments/methodology-statistics), Faculty of Social and Behavioral Sciences, Utrecht
University, The Netherlands in collaboration with [Utrecht Applied Data Science](https://www.uu.nl/en/research/applied-data-science), 
[Information and Technology Services](https://www.uu.nl/en/organisation/information-and-technology-services-its), and [Utrecht University Library](https://www.uu.nl/en/university-library).

For any questions or remarks, please send an email to asreview@uu.nl.

**Coordination**
- [Rens van de Schoot](https://www.rensvandeschoot.com) (Main coordinator, [@Rensvandeschoot](https://github.com/Rensvandeschoot))
- [Daniel Oberski](https://www.uu.nl/staff/DLOberski) (Scientific Director, [@daob](https://github.com/daob))

**Engineers** 
- [Jonathan de Bruin](https://www.uu.nl/staff/JdeBruin1) (Lead engineer, [@J535D165](https://github.com/J535D165))
- [Parisa Zahedi](https://www.linkedin.com/in/parisa-zahedi-28b17148/) ([@parisa-zahedi](https://github.com/parisa-zahedi))
- Raoul Schram ([@qubixes](https://github.com/qubixes))
- [Kees van Eijden](https://www.uu.nl/staff/CJvanEijden) ([@KvEijden](https://github.com/KvEijden))

**Librarians**
- [Jan de Boer](https://www.uu.nl/staff/JdeBoer) 
- [Edu Hackenitz](https://www.uu.nl/staff/EJMHackenitz)
- [Felix Weijdema](https://www.uu.nl/staff/FPWeijdema)
- [Bianca Kramer](https://www.uu.nl/staff/BMRKramer) 

**Affiliated Researchers**
- [Pim Huijnen](https://www.uu.nl/staff/PHuijnen) (Digital Cultural History at the Department of History and Art History)
- [Lars Tummers](https://www.uu.nl/staff/LGTummers) (Public Management and Behavior at Utrecht University, School of Governance)

**Students**
- [Gerbrich Ferdinands](https://www.linkedin.com/in/gerbrich-ferdinands-a21838b8) ([@GerbrichFerdinands](https://github.com/GerbrichFerdinands))
- [Qixiang Fang](https://www.uu.nl/staff/QFang) ([@fqixiang](https://github.com/fqixiang))
- Albert Harkema ([@sasafrass](https://github.com/sasafrass))
