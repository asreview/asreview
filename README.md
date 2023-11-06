<p align="center">
  <a href="https://github.com/asreview/asreview">
    <img width="60%" height="60%" src="https://raw.githubusercontent.com/asreview/asreview-artwork/master/LogoASReview/SVG/GitHub_Repo_Card_Transparent.svg">
  </a>
</p>

## ASReview: Active learning for Systematic Reviews

[![PyPI version](https://badge.fury.io/py/asreview.svg)](https://badge.fury.io/py/asreview) [![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest) [![DOI](https://zenodo.org/badge/164874894.svg)](https://zenodo.org/badge/latestdoi/164874894)
 [![Downloads](https://static.pepy.tech/badge/asreview)](https://github.com/asreview/asreview#installation) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4755/badge)](https://bestpractices.coreinfrastructure.org/projects/4755)

Systematically screening large amounts of textual data is time-consuming and
often tiresome. The rapidly evolving field of Artificial Intelligence (AI) has
allowed the development of AI-aided pipelines that assist in finding relevant
texts for search tasks. A well-established approach to increasing efficiency
is screening prioritization via [Active
Learning](https://asreview.readthedocs.io/en/latest/guides/activelearning.html).

The Active learning for Systematic Reviews (ASReview) project, published in
[*Nature Machine Intelligence*](https://doi.org/10.1038/s42256-020-00287-7)
implements different machine learning algorithms that interactively query the
researcher. ASReview LAB  is designed to accelerate the step of screening
textual data with a minimum of records to be read by a human with no or very
few false negatives. ASReview LAB will save time, increase the quality of
output and strengthen the transparency of work when screening large amounts of
textual data to retrieve relevant information. Active Learning will support 
decision-making in any discipline or industry.

ASReview software implements three different modes:

- **Oracle** :crystal_ball: Screen textual data in
  interaction with the active learning model. The reviewer is the 'oracle',
  making the labeling decisions.
- **Exploration** :triangular_ruler: Explore or
  demonstrate ASReview LAB with a completely labeled dataset. This mode is
  suitable for teaching purposes.
- **Simulation** :chart_with_upwards_trend: Evaluate
  the performance of active learning models on fully labeled data. Simulations
  can be run in ASReview LAB or via the command line interface with more
  advanced options.


## Installation

The ASReview software requires Python 3.8 or later. Detailed step-by-step
instructions to install Python and ASReview are available for
[Windows](https://asreview.ai/installation-guide-windows/) and
[macOS](https://asreview.ai/installation-guide-macos/) users.

```bash
pip install asreview
```

Upgrade ASReview with the following command:

```bash
pip install --upgrade asreview
```

To install ASReview LAB with Docker, see [Install with Docker](https://asreview.readthedocs.io/en/latest/installation.html).

## How it works

[![ASReview LAB explained - animation](https://img.youtube.com/vi/k-a2SCq-LtA/0.jpg)](https://www.youtube.com/watch?v=k-a2SCq-LtA)


## Getting started

[Getting Started with ASReview
LAB](https://asreview.readthedocs.io/en/latest/about.html).

[![ASReview LAB](https://github.com/asreview/asreview/blob/master/images/ASReviewWebApp.png?raw=true)](https://asreview.readthedocs.io/en/latest/lab/overview_lab.html "ASReview LAB")

## Citation

If you wish to cite the underlying methodology of the ASReview software,
please use the following publication in Nature Machine Intelligence:

> van de Schoot, R., de Bruin, J., Schram, R. et al. An open source machine
  learning framework for efficient and transparent systematic reviews.
  Nat Mach Intell 3, 125–133 (2021). https://doi.org/10.1038/s42256-020-00287-7

For citing the software, please refer to the specific release of
the ASReview software on Zenodo https://doi.org/10.5281/zenodo.3345592. The menu on the
right can be used to find the citation format of prevalence.

For more scientific publications on the ASReview software, go to
[asreview.ai/papers](https://asreview.ai/papers/).

## Contact

For an overview of the team working on ASReview, see [ASReview Research Team](https://asreview.ai/about).
ASReview LAB is maintained by
[Jonathan de Bruin](https://github.com/J535D165) and [Yongchao Terry Ma](https://github.com/terrymyc).

The best resources to find an answer to your question or ways to get in
contact with the team are:

- Documentation - [asreview.readthedocs.io](https://asreview.readthedocs.io/)
- Newsletter - [asreview.ai/newsletter/subscribe](https://asreview.ai/newsletter/subscribe)
- Quick tour - [ASReview LAB quick tour](https://asreview.readthedocs.io/en/latest/lab/overview_lab.html)
- Issues or feature requests - [ASReview issue tracker](https://github.com/asreview/asreview/issues)
- FAQ - [ASReview Discussions](https://github.com/asreview/asreview/discussions?discussions_q=sort%3Atop)
- Donation - [asreview.ai/donate](https://asreview.ai/donate)
- Contact - [asreview@uu.nl](mailto:asreview@uu.nl)

## License

The ASReview software has an Apache 2.0 [LICENSE](LICENSE). The ASReview team
accepts no responsibility or liability for the use of the ASReview tool or any
direct or indirect damages arising out of the application of the tool.
