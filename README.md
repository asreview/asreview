<!-- ASReview LAB v2 Banner -->
<p align="center">
  <img width="60%" height="60%" src="https://raw.githubusercontent.com/asreview/asreview-artwork/master/LogoASReview/SVG/GitHub_Repo_Card_Transparent.svg">
</p>

<br/>

<p align="center">
  <b>🎉 ASReview LAB v2 is here! 🎉</b><br>
  <i>Faster, smarter, and more flexible than ever before.<br>
  Discover the new AI models, improved workflow, and enhanced user experience.<br>
  <a href="https://asreview.readthedocs.io/en/latest/">Read the v2 documentation</a> | <a href="https://asreview.app">Try the live demo</a>
  </i>
</p>

<br/>

<p align="center">
  <a href="https://asreview.nl/download"><img src="https://img.shields.io/badge/Installation-FFCD00?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Ik00ODAtMzIwIDI4MC01MjBsNTYtNTggMTA0IDEwNHYtMzI2aDgwdjMyNmwxMDQtMTA0IDU2IDU4LTIwMCAyMDBaTTI0MC0xNjBxLTMzIDAtNTYuNS0yMy41VDE2MC0yNDB2LTEyMGg4MHYxMjBoNDgwdi0xMjBoODB2MTIwcTAgMzMtMjMuNSA1Ni41VDcyMC0xNjBIMjQwWiIvPjwvc3ZnPg=="/></a>
  <a href="https://asreview.readthedocs.org"><img src="https://img.shields.io/badge/Documentation-FFCD00?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Ik0zMjAtMjQwaDMyMHYtODBIMzIwdjgwWm0wLTE2MGgzMjB2LTgwSDMyMHY4MFpNMjQwLTgwcS0zMyAwLTU2LjUtMjMuNVQxNjAtMTYwdi02NDBxMC0zMyAyMy41LTU2LjVUMjQwLTg4MGgzMjBsMjQwIDI0MHY0ODBxMCAzMy0yMy41IDU2LjVUNzIwLTgwSDI0MFptMjgwLTUyMHYtMjAwSDI0MHY2NDBoNDgwdi00NDBINTIwWk0yNDAtODAwdjIwMC0yMDAgNjQwLTY0MFoiLz48L3N2Zz4="/></a>
  <a href="https://asreview.app"><img src="https://img.shields.io/badge/Live_Demo-C00A35?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Ik0yMDAtMTIwcS0zMyAwLTU2LjUtMjMuNVQxMjAtMjAwdi01NjBxMC0zMyAyMy41LTU2LjVUMjAwLTg0MGg1NjBxMzMgMCA1Ni41IDIzLjVUODQwLTc2MHY1NjBxMCAzMy0yMy41IDU2LjVUNzYwLTEyMEg2MDB2LTgwaDE2MHYtNDgwSDIwMHY0ODBoMTYwdjgwSDIwMFptMjQwIDB2LTI0NmwtNjQgNjQtNTYtNTggMTYwLTE2MCAxNjAgMTYwLTU2IDU4LTY0LTY0djI0NmgtODBaIi8+PC9zdmc+&logoColor=white"/></a>
</p>
</br>

## ASReview LAB v2: Active Learning for Systematic Reviews

**ASReview LAB** is an open-source machine learning tool for efficient,
transparent, and interactive screening of large textual datasets. It is widely
used for systematic reviews, meta-analyses, and any scenario requiring
systematic text screening.

*ASReview LAB has been scientifically validated and published in [Nature Machine Intelligence](https://doi.org/10.1038/s42256-020-00287-7).*

### What's New in Version 2?

- **New ELAS AI Models**: Pre-configured, high-performance models for different
  use cases (Ultra, Multilingual, Heavy).
- **Custom Model Builder**: Mix and match feature extractors, classifiers,
  queriers, and balancers.
- **Improved User Experience**: Faster interface, better progress monitoring,
  and more customization options (dark mode, font size, keyboard shortcuts).
- **Enhanced Screening Workflow**: Asynchronous model training, autosave, and
  easy label changes.
- **Advanced Extension Support**: Seamless integration with [ASReview
  Dory](https://github.com/asreview/asreview-dory) and other extensions for
  powerful new features.

---

## Key Features

- **Active Learning**: Interactively prioritize records using AI models that
  learn from your labeling decisions.
- **Flexible AI Models**: Choose from pre-configured ELAS models or build your
  own with custom components.
- **Simulation toolkit**: Assess model performance on fully labeled datasets.
- **Autosave & Label Management**: All decisions are saved automatically;
  easily change labels at any time.
- **User-Centric Design**: Humans are the oracle; the interface is transparent
  and customizable.
- **Privacy First**: No usage or user data is collected.

---

## General Workflow

1. **Import Data**: Load your dataset (CSV, RIS, XLSX, etc.).
2. **Create Project**: Set up a new review or simulation project.
3. **Select Prior Knowledge**: Optionally provide known relevant/irrelevant
   records.
4. **Start Screening**: Label records as relevant or irrelevant; the AI model
   continuously improves.
5. **Monitor Progress**: Use the dashboard to track your progress and decide
   when to stop.
6. **Export Results**: Download your labeled dataset or project file.

---

## AI Models in ASReview LAB

ASReview LAB v2 introduces the **ELAS** (Electronic Learning Assistant System)
models:

| Model             | Short Name | Description                                 | Requirements         |
|-------------------|------------|---------------------------------------------|----------------------|
| ELAS Ultra        | u-series   | Fast, efficient, for most use cases         | None                 |
| ELAS Multilingual | l-series   | Handles multilingual datasets               | Dory extension, CPU/GPU |
| ELAS Heavy        | h-series   | Advanced semantic understanding             | Dory extension, CPU/GPU |

- **Custom Models**: Combine feature extractors (e.g., TF-IDF,
  multilingual-e5-large), classifiers (SVM, Naive Bayes, Neural Networks),
  queriers, and balancers.
- **Extension Support**: Use advanced components from [ASReview
  Dory](https://github.com/asreview/asreview-dory).

See the [Model
Documentation](https://asreview.readthedocs.io/en/latest/lab/models.html) for
details.

---

## Screening Workflow

- **Labeling**: Decide if each record is relevant or irrelevant. The AI model
  updates rankings after each decision.
- **Autosave**: All decisions and notes are saved automatically.
- **Change Decisions**: Edit labels anytime via the Collection page.
- **Full Text Support**: View DOIs and URLs if available in your dataset.
- **Keyboard Shortcuts**: Speed up screening with customizable shortcuts.
- **Model Information**: View which model made each recommendation.
- **Customization**: Switch between dark/light mode and adjust font size.

---

## Installation

Requires Python 3.10 or later.

```bash
pip install asreview
```

Upgrade:

```bash
pip install --upgrade asreview
```

For Docker and advanced installation, see the [installation
guide](https://asreview.readthedocs.io/en/latest/installation.html).

---

## Documentation & Resources

- [Getting Started](https://asreview.readthedocs.io/en/latest/about.html)
- [Quick Tour](https://asreview.readthedocs.io/en/latest/lab/overview_lab.html)
- [Model Guide](https://asreview.readthedocs.io/en/latest/lab/models.html)
- [FAQ](https://github.com/asreview/asreview/discussions?discussions_q=sort%3Atop)
- [Live Demo](https://asreview.app)

---

## Citation

If you use ASReview, please cite:

> van de Schoot, R., de Bruin, J., Schram, R. et al. An open source machine
> learning framework for efficient and transparent systematic reviews. Nat Mach
> Intell 3, 125–133 (2021). https://doi.org/10.1038/s42256-020-00287-7

For software citation, see [Zenodo](https://doi.org/10.5281/zenodo.3345592).

---

## Contact & Community

- [ASReview Research Team](https://asreview.ai/about)
- [Documentation](https://asreview.readthedocs.io/)
- [Newsletter](https://asreview.ai/newsletter/subscribe)
- [Issue Tracker](https://github.com/asreview/asreview/issues)
- [Donate](https://asreview.ai/donate)
- Email: [asreview@uu.nl](mailto:asreview@uu.nl)

[![PyPI
version](https://badge.fury.io/py/asreview.svg)](https://badge.fury.io/py/asreview)
[![DOI](https://zenodo.org/badge/164874894.svg)](https://zenodo.org/badge/latestdoi/164874894)
[![Downloads](https://static.pepy.tech/badge/asreview)](https://github.com/asreview/asreview#installation)
[![CII Best
Practices](https://bestpractices.coreinfrastructure.org/projects/4755/badge)](https://bestpractices.coreinfrastructure.org/projects/4755)

---

## License

ASReview is licensed under the Apache 2.0 [LICENSE](LICENSE). The ASReview team
accepts no responsibility or liability for the use of the tool or any direct or
indirect damages arising out of its application.
