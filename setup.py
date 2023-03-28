# Copyright 2019 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# based on https://github.com/pypa/sampleproject - MIT License

# Always prefer setuptools over distutils
import re
import subprocess
from io import open
from os import path

from setuptools import Command
from setuptools import find_packages
from setuptools import setup

import versioneer


def get_long_description():
    """Get project description based on README."""
    here = path.abspath(path.dirname(__file__))

    # Get the long description from the README file
    with open(path.join(here, 'README.md'), encoding='utf-8') as f:
        long_description = f.read()

    # remove emoji
    long_description = re.sub(r"\:[a-z_]+\:", "", long_description)

    return long_description


DEPS = {
    "sbert": ['sentence_transformers'],
    "doc2vec": ['gensim'],
    "tensorflow": ['tensorflow~=2.0'],
    "dev": ['check-manifest'],
    'test': ['coverage', 'pytest'],
}
DEPS['all'] = DEPS['sbert'] + DEPS['doc2vec'] + DEPS['dev']
DEPS['all'] += DEPS['tensorflow']


class CompileAssets(Command):
    """
    Compile and build the frontend assets using npm and webpack.

    Registered as cmdclass in setup() so it can be called with
    ``python setup.py compile_assets``.
    """

    description = "Compile and build the frontend assets"
    user_options = []

    def initialize_options(self):
        """Set default values for options."""

    def finalize_options(self):
        """Set final values for options."""

    def run(self):
        """Run a command to compile and build assets."""
        subprocess.check_call('sh ./asreview/webapp/compile_assets.sh',
                              shell=True)


def get_cmdclass():
    cmdclass = versioneer.get_cmdclass()
    cmdclass["compile_assets"] = CompileAssets
    return cmdclass


setup(
    name='asreview',
    version=versioneer.get_version(),
    cmdclass=get_cmdclass(),
    description='ASReview LAB - A tool for AI-assisted systematic reviews',
    long_description=get_long_description(),
    long_description_content_type='text/markdown',
    url='https://github.com/asreview/asreview',
    author='ASReview LAB developers',
    author_email='asreview@uu.nl',
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'Topic :: Scientific/Engineering :: Information Analysis',
        'Topic :: Text Processing :: General',
        'Framework :: Flask',
    ],
    keywords=['systematic review', 'machine-learning'],
    packages=find_packages(exclude=['contrib', 'docs', 'tests']),
    package_data={'asreview': [
        'webapp/build/*',
        'webapp/build/static/*/*',
    ]},
    python_requires='~=3.7',
    install_requires=[
        'numpy',
        'scikit-learn',
        'pandas',
        'rispy~=0.7.0',
        'dill',
        'xlrd>=1.0.0',
        'setuptools',
        'flask>=2.0',
        'flask_cors',
        'openpyxl',
        'gevent>=20',
        'jsonschema',
        'filelock',
        'tqdm',
        'datahugger>=0.2'
    ],
    extras_require=DEPS,
    entry_points={
        'console_scripts': [
            'asreview=asreview.__main__:main',
        ],
        'asreview.entry_points': [
            'lab=asreview.entry_points:LABEntryPoint',
            'web_run_model = asreview.entry_points:WebRunModelEntryPoint',
            'simulate=asreview.entry_points:SimulateEntryPoint',
            'algorithms = asreview.entry_points:AlgorithmsEntryPoint',
            'state-inspect = asreview.entry_points:StateInspectEntryPoint'
        ],
        'asreview.readers': [
            '.csv = asreview.lib.io:CSVReader',
            '.tab = asreview.lib.io:CSVReader',
            '.tsv = asreview.lib.io:CSVReader',
            '.ris = asreview.lib.io:RISReader',
            '.txt = asreview.lib.io:RISReader',
            '.xlsx = asreview.lib.io:ExcelReader',
        ],
        'asreview.writers': [
            '.csv = asreview.lib.io:CSVWriter',
            '.tab = asreview.lib.io:TSVWriter',
            '.tsv = asreview.lib.io:TSVWriter',
            '.ris = asreview.lib.io:RISWriter',
            '.txt = asreview.lib.io:RISWriter',
            '.xlsx = asreview.lib.io:ExcelWriter',
        ],
        'asreview.datasets': [
            'benchmark = asreview.lib.datasets:BenchmarkDataGroup',
            'benchmark-nature = asreview.lib.datasets:NaturePublicationDataGroup',
        ],
        'asreview.models.classifiers': [
            'svm = asreview.lib.models.classifiers:SVMClassifier',
            'nb = asreview.lib.models.classifiers:NaiveBayesClassifier',
            'rf = asreview.lib.models.classifiers:RandomForestClassifier',
            'nn-2-layer = asreview.lib.models.classifiers:NN2LayerClassifier',
            'logistic = asreview.lib.models.classifiers:LogisticClassifier',
            'lstm-base = asreview.lib.models.classifiers:LSTMBaseClassifier',
            'lstm-pool = asreview.lib.models.classifiers:LSTMPoolClassifier',
        ],
        'asreview.models.feature_extraction': [
            'doc2vec = asreview.lib.models.feature_extraction:Doc2Vec',
            'embedding-idf = asreview.lib.models.feature_extraction:EmbeddingIdf',
            'embedding-lstm = asreview.lib.models.feature_extraction:EmbeddingLSTM',
            'sbert = asreview.lib.models.feature_extraction:SBERT',
            'tfidf = asreview.lib.models.feature_extraction:Tfidf',
        ],
        'asreview.models.balance': [
            "simple = asreview.lib.models.balance:SimpleBalance",
            "double = asreview.lib.models.balance:DoubleBalance",
            # "triple = asreview.lib.models.balance:TripleBalance",  # Broken, only via API
            "undersample = asreview.lib.models.balance:UndersampleBalance",
        ],
        'asreview.models.query': [
            "max = asreview.lib.models.query.max:MaxQuery",
            "random = asreview.lib.models.query.random:RandomQuery",
            "uncertainty = asreview.lib.models.query.uncertainty:UncertaintyQuery",
            "cluster = asreview.lib.models.query.cluster:ClusterQuery",
            "max_random = asreview.lib.models.query.mixed:MaxRandomQuery",
            "max_uncertainty = asreview.lib.models.query.mixed:MaxUncertaintyQuery",
        ]
    },
    project_urls={
        'Bug Reports': 'https://github.com/asreview/asreview/issues',
        'Source': 'https://github.com/asreview/asreview/',
    },
)
