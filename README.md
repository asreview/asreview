<p align="center">
  <a href="https://github.com/asreview/asreview">
    <img width="60%" height="60%" src="https://raw.githubusercontent.com/asreview/asreview/master/images/RepoCardGithub-1280x640px.png">
  </a>
</p>

## ASReview: Active learning for Systematic Reviews

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fasreview%2Fasreview%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/asreview/asreview/goto?ref=master) [![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg)](https://doi.org/10.5281/zenodo.3345592) [![Downloads](https://pepy.tech/badge/asreview)](https://github.com/asreview/asreview#installation) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4755/badge)](https://bestpractices.coreinfrastructure.org/projects/4755)

Systematic Reviews are “top of the bill” in research. The number of scientific
studies are increasing exponentially in many scholarly fields. Performing a
sound systematic review is a time-consuming and sometimes boring task. The ASReview
software is designed to accelerate the step of screening abstracts and titles
with a minimum of papers to be read by a human with no or very few false
negatives.

The Active learning for Systematic Reviews (ASReview) project, publised in
[*Nature Machine Intelligence*](https://doi.org/10.1038/s42256-020-00287-7),
implements machine learning algorithms that interactively query the
researcher. This way of interactive machine learning is known as [Active
Learning](https://asreview.readthedocs.io/en/latest/guides/activelearning.html).
ASReview offers support for classical learning algorithms and state-of-the-art
learning algorithms like neural networks.

ASReview software implements two different modes:

- **ASReview LAB** :crystal_ball: This modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer classifies them. See [ASReview LAB](https://github.com/asreview/asreview#asreview-lab).
- **Simulate** :chart_with_upwards_trend: The simulation modus is used to measure
  the performance of the active learning software on the results of fully labeled systematic
  reviews. To use the simulation mode, knowledge on programming and bash/Command Prompt
  is highly recommended.
  
Want to keep up-to-date with the latest ASReview updates?
[Sign up for the newsletter 📰](https://asreview.ai/newsletter)

## Installation

The ASReview software requires Python 3.7+. Detailed step-by-step instructions
to install Python and ASReview are available for
[Windows](https://asreview.nl/installation-guide-windows/) and
[macOS](https://asreview.nl/installation-guide-macos/) users. The project is
available on [Pypi](https://pypi.org/project/asreview/). Install the project
with (Windows users might have to use the prefix `python -m`):

```bash
pip install asreview
```

Upgrade ASReview with the following command:

```bash
pip install --upgrade asreview
```

Instructions for usage with Docker are [here](docker/README.md).

## ASReview LAB

ASReview LAB is a user-friendly interface for screening documents and
experimentation with AI-aided systematic reviews. Read more about using the
software in the [Quick
Tour](https://asreview.readthedocs.io/en/latest/lab/overview_lab.html).

[![ASReview LAB](https://github.com/asreview/asreview/blob/master/images/ASReviewWebApp.png?raw=true)](https://asreview.readthedocs.io/en/latest/lab/overview_lab.html "ASReview LAB Quick Tour")

## Citation

The following publication in [Nature Machine
Intelligence](https://doi.org/10.1038/s42256-020-00287-7) can be used to cite
the project.

> van de Schoot, R., de Bruin, J., Schram, R. et al. An open source machine
  learning framework for efficient and transparent systematic reviews.
  Nat Mach Intell 3, 125–133 (2021). https://doi.org/10.1038/s42256-020-00287-7

For citing the software, please refer to the specific release of
the ASReview software on Zenodo https://doi.org/10.5281/zenodo.3345592. The menu on the
right can be used to find the citation format of prevalence.

For more scientific publications on the ASReview software, go to
[asreview.nl/papers](https://asreview.nl/papers/).

## Contact

ASReview is a research project coordinated by [Rens van de
Schoot](www.rensvandeschoot.com) (full professor at the Department of
Methodology & Statistics at [Utrecht University](https://www.uu.nl), The
Netherlands), together with ASReview lead engineer
[Jonathan de Bruin](https://github.com/J535D165). For an overview of the team working on
ASReview, see [ASReview Research Team](https://asreview.readthedocs.io/en/latest/intro/about.html#research-team).

The best resources to find an answer to your question or ways to get in
contact with the team are:

- Documentation - [asreview.readthedocs.io](https://asreview.readthedocs.io/)
- Newsletter - [asreview.ai/newsletter](https://asreview.ai/newsletter)
- Quick tour - [ASReview LAB quick tour](https://asreview.readthedocs.io/en/latest/lab/overview_lab.html)
- Issues or feature requests - [ASReview issue tracker](https://github.com/asreview/asreview/issues)
- FAQ - [ASReview Discussions](https://github.com/asreview/asreview/discussions?discussions_q=sort%3Atop)
- Donation - [asreview.nl/donate](https://asreview.nl/donate)
- Contact - [asreview@uu.nl](mailto:asreview@uu.nl)

## License

The ASReview software has an Apache 2.0 [LICENSE](LICENSE). The ASReview team
accepts no responsibility or liability for the use of the ASReview tool or any
direct or indirect damages arising out of the application of the tool.
