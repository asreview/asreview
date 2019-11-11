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
from setuptools import setup, find_packages
from os import path
from io import open

import versioneer

here = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()


setup(
    name='asreview',
    version=versioneer.get_version(),
    cmdclass=versioneer.get_cmdclass(),
    description='Automated Systematic Review',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/msdslab/automated-systematic-review',
    author='ASReview Core Development Team',
    author_email='asreview@uu.nl',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'License :: OSI Approved :: Apache Software License (Apache 2.0)',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
    ],
    keywords='systematic review',
    packages=find_packages(exclude=['contrib', 'docs', 'tests']),

    install_requires=[
        'numpy',
        'tensorflow',
        'sklearn',
        'pandas',
        'modAL',
        'RISparser',
        'dill',
        'PyInquirer',
        'fuzzywuzzy',
        'h5py',
    ],

    extras_require={
        'dev': ['check-manifest'],
        'test': ['coverage'],
        'performance': ['python-Levenshtein'],
    },

    entry_points={
        'console_scripts': [
            'asreview=asreview.__main__:main',
            'asr=asreview.__main__:main_depr',
        ],

    },

    project_urls={
        'Bug Reports': 'https://github.com/msdslab/automated-systematic-review/issues',  #noqa
        'Source': 'https://github.com/msdslab/automated-systematic-review/',
    },
)
