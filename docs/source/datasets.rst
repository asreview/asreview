Datasets
========================
To perform an automated systematic review, ASReview requires a dataset of papers.
The dataset of papers usually results from an online library search for all studies related to the topic to review.
All papers in the dataset need to be screened, with the goal to select all relevant papers. 

For testing and demonstrating ASReview, the software offers `three built-in datasets <#built-in-demonstration-datasets>`__
It is also possible to perform an automated systematic review on `your own dataset <#using-your-own-data>`__.
Every paper in the dataset carries metadata such as title, abstract, author, et cetera. 

Built-in demonstration datasets
---------------------
The built-in datasets come from 'traditional' systematic reviews on various research topics. 
All papers who were selected in the original systematic review are indicated.
This information can be used to compare performance of ASReview with the original systematic review. 

Van de Schoot
~~~~~~~~~~~~~~
A dataset of 11,395 papers on posttraumatic stress disorder. Of these papers, 34 were included in the systematic review.

    "We performed a systematic search to identify longitudinal studies that applied LGMM, latent growth curve analysis, or hierarchical cluster analysis on symptoms of posttraumatic stress assessed after trauma exposure."

**Bayesian PTSD-Trajectory Analysis with Informed Priors Based on a Systematic Literature Search and Expert Elicitation**
Rens van de Schoot ORCID Icon, Marit Sijbrandij, Sarah Depaoli ORCID Icon, Sonja D. Winter ORCID Icon, Miranda Olff & Nancy E. van Loey
https://doi.org/10.1080/00273171.2017.1412293

Dataset publication: https://osf.io/h5k2q/

Call: ``example_ptsd``

Hall
~~~~~~~~~~~~~~
A dataset of 8911 papers on fault prediction performance in software engineering. Of these papers, 106 were included in the systematic review.

The dataset results from

**How to Read Less: Better Machine Assisted Reading Methods for Systematic Literature Reviews.**
Yu, Zhe, Kraft, Nicholas, Menzies, Tim. (2016). https://www.researchgate.net/publication/311586326_How_to_Read_Less_Better_Machine_Assisted_Reading_Methods_for_Systematic_Literature_Reviews 

The original study can be be found here:

**A systematic literature review on fault prediction performance in software engineering**
T. Hall, S. Beecham, D. Bowes, D. Gray, S. Counsell, in IEEE Transactions on Software Engineering, vol. 38, no. 6, pp. 1276-1304, Nov.-Dec. 2012. https://doi.org/10.1109/TSE.2011.103

Dataset publication https://zenodo.org/record/1162952#.XiBgMi2ZNQK 

Call: ``example_hall``


Cohen
~~~~~~~~~~~~~~
This is a standard dataset from the medical sciences to test the performance of automated review systems such as the ASReview project. 

**Reducing Workload in Systematic Review Preparation Using Automated Citation Classification**
A.M. Cohen, MD, MS, W.R. Hersh, MD, K. Peterson, MS, and Po-Yin Yen, MS
https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1447545/

Call: ``example_cohen``


Using your own data
---------------------
    This instruction is currently under construction. 
    
To carry out an automated systematic review on your own dataset, your datafile needs to adhere to a certain format. 

ASReview accepts the following formats: 
 - ` .ris` 
 - ` .csv` / ` .xlsx` / ` .xls` 

Such a format can be obtained by exporting your papers from your reference manager, e.g. RefWorks, Mendeley, EndNote, ZoTero.

