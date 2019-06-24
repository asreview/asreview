# based on https://github.com/pypa/sampleproject
# MIT License

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
    author='MSDSLab',
    author_email='j.debruin1@uu.nl',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'License :: OSI Approved :: MIT License',
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
        'RISparser'
    ],

    extras_require={
        'dev': ['check-manifest'],
        'test': ['coverage'],
    },

    # package_data={
    #     'sample': ['data/package_data.dat'],
    # },
    # data_files=[('my_data', ['data/data_file'])],

    entry_points={
        'console_scripts': [
            'asr=asr.__main__:main',
            'asreview=asr.__main__:main'],

    },

    project_urls={
        'Bug Reports': 'https://github.com/msdslab/automated-systematic-review/issues',
        'Source': 'https://github.com/msdslab/automated-systematic-review/',
    },
)
