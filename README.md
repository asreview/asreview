[![ASReview bot](images/RepoCardGithub-1280x640px.png)](https://github.com/asreview/asreview)

## ASReview: Active learning for systematic reviews

Systematic Reviews are “top of the bill” in research. The number of scientific studies is increasing exponentially in many scholarly fields. Performing a
sound systematic review is a time-consuming and sometimes boring task. Our
software is designed to accelerate the step of screening abstracts and titles
with a minimum of papers to be read by a human with no or very few false negatives.

The Active learning for Systematic Reviews (ASReview) project implements learning algorithms that interactively query the
researcher. This way of interactive training is known as
[Active Learning](https://en.wikipedia.org/wiki/Active_learning_(machine_learning)).
ASReview offers support for classical learning algorithms and
state-of-the-art learning algorithms like neural networks.

ASReview software implements two different modes:

- **Oracle** :crystal_ball: The oracle modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer classifies them. See [ASReview App](asreview-app).
- **Simulate** :chart_with_upwards_trend: The simulation modus is used to measure the performance of our
  software on existing systematic reviews. The software shows how many
  papers you could have potentially skipped during the systematic review.

## Installation

The ASReview software requires Python 3.6+. The project is available on [Pypi](https://pypi.org/project/asreview/). Install the
project with (for windows users add `python -m`):

```bash
pip install asreview
```

Upgrade ASReview with the following command:

```bash
pip install --upgrade asreview
```


## ASReview app

The ASReview team developed a user-friendly user interface to replace the old command line interface. The new interface is still under development but is already available for testing and training purposes. 

[![ASReview Command Line Interface](https://github.com/asreview/asreview/blob/master/images/ASReviewWebApp.png?raw=true)](https://asreview.readthedocs.io/en/latest/quicktour.html "ASReview Quick Tour")


## Covid-19 plugin

[![Covid-19 Plugin](https://github.com/asreview/asreview/blob/master/images/intro-covid19-small.png?raw=true)](https://github.com/asreview/asreview-covid19 "ASReview against COVID-19")

The ASReview team developed a plugin for researchers and doctors to facilitate the reading of literature on the Coronavirus. The [plugin](https://github.com/asreview/asreview-covid19) makes the [CORD-19](https://pages.semanticscholar.org/coronavirus-research) dataset available in the ASReview software. We also constructed a second database with studies published after December 1st 2019 to search for relevant papers published during the Covid-19 crisis. 

Install the plugin with the command below.

```
pip install asreview-covid19
```


## Documentation

Documentation is available at [asreview.rtfd.io](https://asreview.rtfd.io). Please have a look at https://asreview.readthedocs.io/en/latest/quicktour.html for a quick tour through the user interface.

- [automated-systematic-review-datasets](https://github.com/asreview/systematic-review-datasets) A project with systematic review datasets optimized and processed for use with ASReview or other systematic review software. The project describes the preferred format to store systematic review datasets.
- [automated-systematic-review-simulations](https://github.com/asreview/automated-systematic-review-simulations) A repository with scripts for a simulation study and scripts for the aggregation and visualisation of the results.


## Contributing


[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fasreview%2Fasreview%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/asreview/asreview/goto?ref=master)[![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg)](https://doi.org/10.5281/zenodo.3345592)

## Contact
This project is coordinated by by [Rens van de Schoot](https://www.rensvandeschoot.com) ([@Rensvandeschoot](https://github.com/Rensvandeschoot)) and [Daniel Oberski](https://www.uu.nl/staff/DLOberski) ([@daob](https://github.com/daob)) and is part of the research work conducted by the [Department of
Methodology & Statistics](https://www.uu.nl/en/organisation/faculty-of-social-and-behavioural-sciences/about-the-faculty/departments/methodology-statistics), Faculty of Social and Behavioral Sciences, Utrecht
University, The Netherlands. Maintainers are [Jonathan de Bruin](https://www.uu.nl/staff/JdeBruin1) (Lead engineer, [@J535D165](https://github.com/J535D165)) and Raoul Schram ([@qubixes](https://github.com/qubixes)).

Got ideas for improvement? We would love to hear about your suggestions! Get started [here :arrow_left:](https://github.com/asreview/asreview/blob/master/CONTRIBUTING.md). See who have contributed to ASReview [here](https://github.com/asreview/asreview/blob/master/CONTRIBUTORS.md). For any questions or remarks, please send an email to asreview@uu.nl.


## License and Citation

The ASReview software has an Apache 2.0 [LICENSE](LICENSE).

A research paper is coming up for this project. In the mean time, it can be cited with (fill in x and y for the version number):

```
ASReview Core Development Team (2019). ASReview: Software for automated systematic reviews [version 0.x.y]. Utrecht University, Utrecht, The Netherlands. Available at https://github.com/asreview/asreview.
```

BibTeX:

```bibtex
@Manual{,
    title = {ASReview: Active learning for systematic reviews},
    author = {{ASReview Core Development Team}},
    organization = {Utrecht University},
    address = {Utrecht, The Netherlands},
    year = 2019,
    doi = {10.5281/zenodo.3345592},
    url = {https://doi.org/10.5281/zenodo.3345592}
}
```
