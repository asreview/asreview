[![ASReview bot](images/RepoCardGithub-1280x640px.png)](https://github.com/msdslab/automated-systematic-review)

## ASReview: Active learning for systematic reviews

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fmsdslab%2Fautomated-systematic-review%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/msdslab/automated-systematic-review/goto?ref=master)[![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3345592.svg)](https://doi.org/10.5281/zenodo.3345592)

:wrench: *This project is work in progress and not production ready.*

---

:point_right: [Check out our new tutorial "10 minutes into ASReview"](https://asreview.readthedocs.io/en/latest/10minutes_asreview.html) :point_left:

Systematic Reviews are “top of the bill” in research. The number of systematic
reviews published by researchers increases year after year. But performing a
sound systematic review is a time-consuming and sometimes boring task. Our
software is designed to accelerate the step of screening abstracts and titles
with a minimum of papers to be read by a human with no or very few false negatives. 

The Automated Systematic Review (ASReview) project implements learning algorithms that interactively query the
researcher. This way of interactive training is known as
[Active Learning](https://en.wikipedia.org/wiki/Active_learning_(machine_learning)).
ASReview offers support for classical learning algorithms and
state-of-the-art learning algorithms like neural networks. The following image
gives an overview of the process.

[![Active Learning for reviewing papers](https://github.com/msdslab/automated-systematic-review/blob/master/images/deepreview.png?raw=true)](https://github.com/msdslab/automated-systematic-review)

Our ASReview software implements two different modes:

- **Oracle** :crystal_ball: The oracle modus is used to perform a systematic review with
  interaction by the reviewer (the 'oracle' in literature on active learning).
  The software presents papers to the reviewer, whereafter the reviewer classifies them.
- **Simulate** :chart_with_upwards_trend: The simulation modus is used to measure the performance of our
  software on existing systematic reviews. The software shows how many
  papers you could have potentially skipped during the systematic review.


## Installation

The ASReview software requires Python 3.6+. The project is available on [Pypi](https://pypi.org/project/asreview/). Install the 
project with:

```bash 
pip install asreview
```

Or, install the development version of the Automated Systematic Review project directly 
from this Github page.

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

![ASReview Command Line Interface](https://github.com/msdslab/automated-systematic-review/raw/master/docs/gifs/asreview-intro.gif)

This command (`asreview oracle`) runs the software in oracle mode on the 
`YOUR_DATA.csv` dataset. 

The higher the number of papers that you manually include in ASReview,
the quicker the ASReview software will understand your choices for inclusion.
The IDs are the identifiers of papers, starting from
0 for the first paper found in the dataset.

To benchmark an already executed review, use the simulation modus (`asreview simulation`).
The dataset then needs an additional column ("label_included") to signify their inclusion
in the final review. The command for the simulation modus is similar to the oracle
mode:

``` sh
asreview simulate YOUR_DATA.csv --n_prior_included 5 --n_prior_excluded 5 --log_file results.h5
```

## Resources 

- The full documentation is available at [asreview.rtfd.io](https://asreview.rtfd.io)
- [10 Minutes into ASReview](https://asreview.readthedocs.io/en/latest/10minutes_asreview.html) An introduction into ASReview for new users. 
- [automated-systematic-review-datasets](https://github.com/msdslab/automated-systematic-review-datasets) A project for collection, preprocessing and publication of systematic review datasets. The project describes the  data storage format used by the software.
- [automated-systematic-review-simulations](https://github.com/msdslab/automated-systematic-review-simulations) A repository with scripts for a simulation study and scripts for the aggregation and visualisation of the results.


## License
[LICENSE](LICENSE)


## Publications

- Dutch newspaper NRC on this project ["Software vist de beste artikelen uit een bibliotheek van duizenden."](https://www.nrc.nl/nieuws/2019/01/14/software-vist-de-beste-artikelen-eruit-a3628952)
- News site of Utrecht University: [ASReview: Smart source screening software for academia and beyond](https://www.uu.nl/en/news/asreview-smart-source-screening-software-for-academia-and-beyond)
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
    title = {ASReview: Active learning for systematic reviews},
    author = {{ASReview Core Development Team}},
    organization = {Utrecht University},
    address = {Utrecht, The Netherlands},
    year = 2019,
    doi = {10.5281/zenodo.3345592},
    url = {https://doi.org/10.5281/zenodo.3345592}
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
