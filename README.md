<p align="center">
  <a href="https://github.com/asreview/asreview">
    <img width="60%" height="60%" src="https://raw.githubusercontent.com/asreview/asreview-artwork/master/LogoASReview/SVG/GitHub_Repo_Card_Transparent.svg">
  </a>
</p>

## ASReview: Active learning for Systematic Reviews

[![PyPI version](https://badge.fury.io/py/asreview.svg)](https://badge.fury.io/py/asreview) [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fasreview%2Fasreview%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/asreview/asreview/goto?ref=master) [![Documentation Status](https://readthedocs.org/projects/asreview/badge/?version=latest)](https://asreview.readthedocs.io/en/latest/?badge=latest) [![DOI](https://zenodo.org/badge/164874894.svg)](https://zenodo.org/badge/latestdoi/164874894)
 [![Downloads](https://pepy.tech/badge/asreview)](https://github.com/asreview/asreview#installation) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/4755/badge)](https://bestpractices.coreinfrastructure.org/projects/4755)

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

The ASReview software requires Python 3.7+. Detailed step-by-step instructions
to install Python and ASReview are available for
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

## Authentication

It is possible to run ASReview with authentication, enabling multiple users to run their
projects in their own separate workspaces. Authentication requires the storage of user
accounts and link these accounts to projects. Currently we are using a small SQLite 
database (asreview.development.sqlite or asreview.production.sqlite) in the ASReview 
folder to store that information.

### Bare bones authentication

Using authentication imposes more configuration. Let's start with running a bare bones
authenticated version of the application from the CLI:
```
$ python3 -m asreview lab --enable-auth --secret-key=<secret key> --salt=<salt>
```
where `--enable-auth` forces the application to run in an authenticated mode, 
`<secret key>` is a string that is used for encrypting cookies and `<salt>` is
a string that is used to hash passwords.

This bare bones application only allows an administrator to create user accounts by 
editing the database without the use of the ASReview application! To facilitate this,
one could use the User model that can be found in `/asreview/webapp/authentication/models.py`. Note that with this simple configuration it is not possible for a user to change forgotten passwords without the assistance of the administrator.

### Full configuration

To configure the authentication in more detail we need to create a JSON file
that contains all authentication parameters. The keys in that JSON file will override any parameter that was passed in the CLI. Here's an example:
```
{
    "DEBUG": true,
    "AUTHENTICATION_ENABLED": true,
    "SECRET_KEY": "<secret key>",
    "SECURITY_PASSWORD_SALT": "<salt>",
    "SESSION_COOKIE_SECURE": true,
    "REMEMBER_COOKIE_SECURE": true,
    "SESSION_COOKIE_SAMESITE": "Lax",
    "SQLALCHEMY_TRACK_MODIFICATIONS": true,
    "ALLOW_ACCOUNT_CREATION": true,
    "EMAIL_VERIFICATION": true,
    "EMAIL_CONFIG": {
        "SERVER": "<smtp-server>",
        "PORT": <smpt-server-port>,
        "USERNAME": "<smtp-server-username>",
        "PASSWORD": "<smtp-server-password>",
        "USE_TLS": false,
        "USE_SSL": true,
        "REPLY_ADDRESS": "<preferred reply email address>"
    },
    "OAUTH": {
        "GitHub": {
            "AUTHORIZATION_URL": "https://github.com/login/oauth/authorize",
            "TOKEN_URL": "https://github.com/login/oauth/access_token",
            "CLIENT_ID": "<GitHub client ID>",
            "CLIENT_SECRET": "<GitHub client secret>",
            "SCOPE": ""
        },
        "Orcid": {
            "AUTHORIZATION_URL": "https://sandbox.orcid.org/oauth/authorize",
            "TOKEN_URL": "https://sandbox.orcid.org/oauth/token",
            "CLIENT_ID": "<Orcid client ID>",
            "CLIENT_SECRET": "<Orcid client secret>",
            "SCOPE": "/authenticate"
        },
        "Google": {
            "AUTHORIZATION_URL": "https://accounts.google.com/o/oauth2/auth",
            "TOKEN_URL": "https://oauth2.googleapis.com/token",
            "CLIENT_ID": "<Google client ID>",
            "CLIENT_SECRET": "<Google client secret>",
            "SCOPE": "profile email"
        }
    }
}
```
Store the JSON file on the server and start the ASReview application from the CLI with the
`--flask-configfile` parameter:
```
$ FLASK_DEBUG=1 python3 -m asreview lab --flask-configfile=<path-to-JSON-config-file>
```
A number of the keys in the JSON file are standard Flask parameters. The keys that are specific for authenticating ASReview 

pare summarised below:
*  AUTHENTICATION_ENABLED: if set to `true` the application will start with authentication enabled. If the SQLite database does not exist, one will be created during startup.
* SECRET_KEY: the secret key is a string that is used to encrypt cookies and is mandatory if authentication is required.
* SECURITY_PASSWORD_SALT: another string used to hash passwords, also mandatory if authentication is required.
* ALLOW_ACCOUNT_CREATION: enables account creation by users, either by front- or backend.
* EMAIL_VERIFICATION: used in conjunction with ALLOW_ACCOUNT_CREATION. If set to `true` the system sends a verification email after account creation. Only relevant if the account is __not__ created by OAuth. This parameter can be omitted if you don't want verification.
* EMAIL_CONFIG: configuration of the SMTP email server that is used for email verification. It also allows users to retrieve a new password after forgetting it. Don't forget to enter the reply address (REPLY_ADDRESS) of your system emails. Omit this parameter if system emails for verification and password retrieval are unwanted.
* OAUTH: an authenticated ASReview application may integrate with the OAuth functionality of Github, Orcid and Google. Provide the necessary OAuth login credentails (for [Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Orcid](https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/) en [Google](https://support.google.com/cloud/answer/6158849?hl=en)). Please note that the AUTHORIZATION_URL and TOKEN_URL of the Orcid entry are sandbox-urls, and thus not to be used in production. Omit this parameter if OAuth is unwanted.

### Converting an unauthenticated application in an authenticated one

At the moment there is a very basic tool to convert your unauthenticated ASReview application into an authenticated one. The following steps sketch a possible approach for the conversion:

1. In the ASReview folder (by default `~/.asreview`) you can find all projects that were created by users in the unauthenticated version. Every sub-folder contains a single project. Make sure you can link those projects to a certain user. In other words: make sure you know which project should be linked to which user.
2. Start the application, preferably with using the config JSON file and setting the ALLOW_ACCOUNT_CREATION to `true`.
3. Use the backend to create user accounts (done with a POST request to `/auth/signup`, see `/asreview/webapp/api/auth.py`). Make sure a full name is provided for every user account. Once done, one could restart the application with ALLOW_ACCOUNT_CREATION set to `False` if account creation by users is undesired.
4. Run the `auth_conversion.py` (root folder) script and follow instructions. The script iterates over all project folders in the ASReview folder and asks which user account has to be associated with it. The script will establish the connection in the SQlite database and rename the project folders accordingly.

TODO@Jonathan @Peter: I have verified this approach. It worked for me but
obviously needs more testing. I don't think it has to grow into a bombproof solution, but should be used as a stepping stone for an admin
with a little bit of Python knowledge who wants to upgrade to an authenticated version. Anyhow: give it a spin: create a couple of projects, rename the folders in the original project_ids and remove from the projects folder. The script should restore all information.

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
