Datasets
========================
To perform an automated systematic review, ASReview requires a dataset of papers that are selected for screening.
For testing and demonstrating ASReview, the software offers `three built-in datasets <#built-in-demonstration-datasets>`__
It is also possible to perform an automated systematic review on `your own dataset <#using-your-own-data>`__.

The dataset of papers usually results from a (library?) search for all studies related to the topic of the review. 
The goal of ASReview is to select papers from the dataset that are relevant for the systematic review. 
Every paper in the dataset should carry metadata (e.g. title, abstract, author, etc). 

Built-in demonstration datasets
---------------------
The three built-in datasets in 
Each dataset contains metadata on all papers obtained in the systematic search.
All papers who were included in the original study are indicated.

Van de Schoot
~~~~~~~~~~~~~~

A dataset of 11,395 papers on posttraumatic stress disorder. Of these papers, 34 were included in the systematic review.

    "We performed a systematic search to identify longitudinal studies that applied LGMM, latent growth curve analysis, or hierarchical cluster analysis on symptoms of posttraumatic stress assessed after trauma exposure."

**Bayesian PTSD-Trajectory Analysis with Informed Priors Based on a Systematic Literature Search and Expert Elicitation**
Rens van de Schoot ORCID Icon, Marit Sijbrandij, Sarah Depaoli ORCID Icon, Sonja D. Winter ORCID Icon, Miranda Olff & Nancy E. van Loey
https://doi.org/10.1080/00273171.2017.1412293

Dataset publication: https://osf.io/h5k2q/


``example_ptsd``

Hall
~~~~~~~~~~~~~~

This folder contains all 4 data sets used in the paper
hall = one of the four data sets  
"How to Read Less: Better Machine Assisted Reading Methods for Systematic Literature Reviews" (by Yu, Kraft & Menzies, 2016).

Please kindly note that three of these data sets (Hall, Radjenovic and Wahono) contain only three columns: title, abstract, included.

``example_hall``

Cohen
~~~~~~~~~~~~~~
This is a standard dataset from the medical sciences to test the performance of automated review systems such as the ASReview project. This readme describes the process to obtain CSV data files that can be used by the ASReview software to benchmark/test its performance.

Reducing Workload in Systematic Review Preparation Using Automated Citation Classification A.M. Cohen, MD, MS, W.R. Hersh, MD, K. Peterson, MS, and Po-Yin Yen, MS https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1447545/



``example_cohen``

Using your own data
---------------------
To carry out an automated systematic review on your own dataset, your datafile needs to adhere to a certain format. 

ASReview accepts the following formats: 
.ris, .csv/(excel files)

Such a format can be obtained by exporting your papers from your reference manager . RefWorks, Mendeley, EndNote, ZoTero). 
This can be obtained by exporting your papers from your reference manager (refworks, mendeley, endnote, zotero)

