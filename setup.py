# based on https://github.com/pypa/sampleproject
# MIT License

# Always prefer setuptools over distutils
from setuptools import setup, find_packages
from os import path
from io import open

here = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='asr',
    version='0.0.1',
    description='Automated Systematic Review',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/msdslab/automated-systematic-review',
    author='MSDSLab',
    author_email='j.debruin1@uu.nl',
    classifiers=[
        # How mature is this project? Common values are
        #   3 - Alpha
        #   4 - Beta
        #   5 - Production/Stable
        'Development Status :: 3 - Alpha',

        # Pick your license as you wish
        'License :: OSI Approved :: MIT License',

        # Specify the Python versions you support here. In particular, ensure
        # that you indicate whether you support Python 2, Python 3 or both.
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
    ],
    keywords='systematic review',
    packages=find_packages(exclude=['contrib', 'docs', 'tests']),

    install_requires=['numpy', 'keras', 'sklearn'],

    extras_require={
        'dev': ['check-manifest'],
        'test': ['coverage'],
    },

    # package_data={
    #     'sample': ['data/package_data.dat'],
    # },
    # data_files=[('my_data', ['data/data_file'])],

    entry_points={
        'console_scripts': ['asr=asr.systematic_review_active:main'],
    },

    project_urls={
        'Bug Reports': 'https://github.com/msdslab/automated-systematic-review/issues',
        'Source': 'https://github.com/msdslab/automated-systematic-review/',
    },
)