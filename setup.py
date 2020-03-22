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
from setuptools import setup, find_packages
from os import path
from io import open

import versioneer


def get_long_description():
    """Get project description based on README"""
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
    "tensorflow": ['tensorflow'],
    "dev": ['check-manifest'],
    'test': ['coverage', 'pytest'],
}
DEPS['all'] = DEPS['sbert'] + DEPS['doc2vec'] + DEPS['dev']
DEPS['all'] += DEPS['tensorflow']

setup(
    name='asreview',
    version=versioneer.get_version(),
    cmdclass=versioneer.get_cmdclass(),
    description='Automated Systematic Review',
    long_description=get_long_description(),
    long_description_content_type='text/markdown',
    url='https://github.com/asreview/asreview',
    author='ASReview Core Development Team',
    author_email='asreview@uu.nl',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
    ],
    keywords='systematic review',
    packages=find_packages(exclude=['contrib', 'docs', 'tests']),
    python_requires='~=3.6',
    install_requires=[
        'numpy',
        'sklearn',
        'pandas',
        'modAL',
        'RISparser',
        'dill',
        'questionary',
        'rapidfuzz',
        'h5py',
        'xlrd>=1.0.0',
        'setuptools',
    ],
    extras_require=DEPS,
    entry_points={
        'console_scripts': [
            'asreview=asreview.__main__:main'
        ],
        'asreview.entry_points': [
            'simulate = asreview.entry_points:SimulateEntryPoint',
            'oracle = asreview.entry_points:OracleEntryPoint',
        ],
        'asreview.readers': [
            '.csv = asreview.io.csv_reader:read_csv',
            '.ris = asreview.io.ris_reader:read_ris',
            '.txt = asreview.io.ris_reader:read_ris',
            '.xlsx = asreview.io.excel_reader:read_excel',
            '.xml = asreview.io.pubmed_xml_reader: read_pubmed_xml',
        ],
        'asreview.datasets': [
            'builtin = asreview.datasets:BuiltinDataGroup',
        ],
        'asreview.models': [
            'svm = asreview.models.svm:SVMModel',
            'nb = asreview.models.nb:NBModel',
            'rf = asreview.models.rf:RFModel',
            'nn-2-layer = asreview.models.nn_2_layer:NN2LayerModel',
            'logistic = asreview.models.logistic:LogisticModel',
            'lstm-base = asreview.models.lstm_base:LSTMBaseModel',
            'lstm-pool = asreview.models.lstm_pool:LSTMPoolModel',
        ],
        'asreview.feature_extraction': [
            'doc2vec = asreview.feature_extraction.doc2vec:Doc2Vec',
            'embedding-idf = asreview.feature_extraction.embedding_idf:EmbeddingIdf',  #noqa
            'embedding-lstm = asreview.feature_extraction.embedding_lstm:EmbeddingLSTM',  #noqa
            'sbert = asreview.feature_extraction.sbert:SBERT',
            'tfidf = asreview.feature_extraction.tfidf:Tfidf',
        ]
    },
    project_urls={
        'Bug Reports':
            'https://github.com/asreview/asreview/issues',
        'Source': 'https://github.com/asreview/asreview/',
    },
)
