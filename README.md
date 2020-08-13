[![ASReview logo](https://github.com/asreview/asreview/blob/master/images/RepoCardGithub-1280x640px.png?raw=true)](https://github.com/asreview/asreview)

## ASReview: Active learning for Systematic Reviews

Systematic Reviews are “top of the bill” in research. The number of scientific studies is increasing exponentially in many scholarly fields. Performing a
sound systematic review is a time-consuming and sometimes boring task. Our
software is designed to accelerate the step of screening abstracts and titles
with a minimum of papers to be read by a human with no or very few false negatives.

The Active learning for Systematic Reviews (ASReview) project implements machine learning algorithms that interactively query the
researcher. This way of interactive machine learning is known as
[Active Learning](https://en.wikipedia.org/wiki/Active_learning_(machine_learning)).
ASReview offers support for classical learning algorithms and
state-of-the-art learning algorithms like neural networks.

ASReview software implements two different modes:

- **ASReview LAB** :crystal_ball: This modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer classifies them. See [ASReview LAB](https://github.com/asreview/asreview#asreview-lab).
- **Simulate** :chart_with_upwards_trend: The simulation modus is used to measure
  the performance of the active learning software on the results of fully labeled systematic
  reviews. To use the simulation mode, knowledge on programming and bash/Command Prompt
  is highly recommanded.

## Installation

The ASReview software requires Python 3.6+. Detailed
step-by-step instructions to install Python and ASReview are available for
[Windows](https://asreview.nl/installation-guide-windows/) and [macOS](https://asreview.nl/installation-guide-mac/) users. The project is available on [Pypi](https://pypi.org/project/asreview/). Install the
project with (Windows users might have to use the prefix `python -m`):

```bash
pip install asreview
```

Upgrade ASReview with the following command:

```bash
pip install --upgrade asreview
```

## ASReview LAB

ASReview LAB is a user-friendly interface for screening documents and experimentation with AI-aided systematic reviews. Read more about using the software in the [Quick Tour](https://asreview.readthedocs.io/en/latest/quicktour.html).

[![ASReview LAB](https://github.com/asreview/asreview/blob/master/images/ASReviewWebApp.png?raw=true)](https://asreview.readthedocs.io/en/latest/quicktour.html "ASReview LAB Quick Tour")


## Covid-19 plugin

[![Covid-19 Plugin](https://github.com/asreview/asreview/blob/master/images/intro-covid19-small.png?raw=true)](https://github.com/asreview/asreview-covid19 "ASReview against COVID-19")

The ASReview team developed a plugin for researchers and doctors to facilitate the reading of literature on the Coronavirus. The [plugin](https://github.com/asreview/asreview-covid19) makes the [CORD-19](https://pages.semanticscholar.org/coronavirus-research) dataset available in the ASReview software. A second database with studies published after December 1st 2019 is available as well (this dataset is more specific for publications on COVID-19).

Install the plugin with the command below.

```
pip install asreview-covid19
```


## Documentation

Documentation is available at [asreview.rtfd.io](https://asreview.rtfd.io). Please have a look at https://asreview.readthedocs.io/en/latest/quicktour.html for a quick tour through the user interface.

Check out the ASReview website, https://asreview.nl/, for more information and our blog.

- [systematic-review-datasets](https://github.com/asreview/systematic-review-datasets) A project with systematic review datasets optimized and processed for use with ASReview or other systematic review software. The project describes the preferred format to store systematic review datasets.
- [systematic-review-simulations](https://github.com/asreview/automated-systematic-review-simulations) A repository with scripts for a simulation study and scripts for the aggregation and visualisation of the results.

## Contact
This project is coordinated by [Rens van de Schoot](https://www.rensvandeschoot.com) ([@Rensvandeschoot](https://github.com/Rensvandeschoot)) and [Daniel Oberski](https://www.uu.nl/staff/DLOberski) ([@daob](https://github.com/daob)) and is part of the research work conducted by the [Department of
Methodology & Statistics](https://www.uu.nl/en/organisation/faculty-of-social-and-behavioural-sciences/about-the-faculty/departments/methodology-statistics), Faculty of Social and Behavioral Sciences, Utrecht
University, The Netherlands. Maintainers are [Jonathan de Bruin](https://www.uu.nl/staff/JdeBruin1) (Lead engineer, [@J535D165](https://github.com/J535D165)) and Raoul Schram ([@qubixes](https://github.com/qubixes)).

Got ideas for improvement? We would love to hear about your suggestions! Get started [here :arrow_left:](https://github.com/asreview/asreview/blob/master/CONTRIBUTING.md). See who have contributed to ASReview [here](https://github.com/asreview/asreview/blob/master/CONTRIBUTORS.md). For any questions or remarks, please send an email to asreview@uu.nl.


## License

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fasreview%2Fasreview%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/asreview/asreview/goto?ref=master) [![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg)](https://doi.org/10.5281/zenodo.3345592)


The ASReview software has an Apache 2.0 [LICENSE](LICENSE). The ASReview team accepts no responsibility or liability for the use of the ASReview tool or any direct or indirect damages arising out of the application of the tool.


## Citation

The preprint [ArXiv:2006.12166](http://arxiv.org/abs/2006.12166) can be used to cite this project.

```
van de Schoot, Rens, et al. “ASReview: Open Source Software for Efficient and
Transparent Active Learning for Systematic Reviews.” ArXiv:2006.12166 [Cs],
June 2020. arXiv.org, http://arxiv.org/abs/2006.12166.
```

For citing the software, please refer to the specific release of the ASReview software on Zenodo [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg)](https://doi.org/10.5281/zenodo.3345592). The menu on the right can be used to find the citation format of prevalence.

