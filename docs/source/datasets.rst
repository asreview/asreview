Data sets
=========
To perform an automated systematic review, ASReview requires a data set representing
all papers obtained in a systematic search. To create such a data set for a systematic
review, typically an online library search is performed for all studies related to a
particular topic.

Each entry in the data set should hold metadata on a paper. 
Mandatory metadata are ``title`` and ``abstract``.
Other metadata such as ``id``, ``author``, ``date``, and ``keywords`` are optional.
When using ASReview in simulation mode, an additional binary variable to indicate
labeling decisions is required, called ``included`` or ``label_included``. 
All entries in the data set need to be screened, with the goal to select all relevant papers. 

For testing and demonstrating ASReview, the software offers
`three built-in data sets <#built-in-demonstration-data-sets>`__
It is also possible to perform an automated systematic review on
`your own data set <#using-your-own-data>`__.


Using your own data
-------------------
    This instruction is currently under construction. 
    
To carry out an automated systematic review on your own data set, your datafile needs 
to adhere to a certain format. ASReview accepts the following formats: 

 - `Research Information Systems (RIS) <https://en.wikipedia.org/wiki/RIS_(file_format)>`_. 
   Extension ``.ris``. RIS files are used by digital libraries, like IEEE Xplore, Scopus 
   and ScienceDirect. Citation managers Mendeley, RefWorks, Zotero, and EndNote support 
   the RIS format as well. 
 - **Tabular data sets**. Extensions ``.csv``, ``.xlsx``, and ``.xls``. CSV files should 
   be comma separated and UTF-8 encoded. For CSV files, the software accepts a set of 
   predetermined labels in line with the ones used in RIS files. 



Built-in demonstration data sets
--------------------------------
The built-in data sets are PRISMA based reviews on various research topics. 
All papers selected in the original systematic review are indicated.
This information can be used to simulate the performance of ASReview. 

PTSD-data
~~~~~~~~~~~~~
A data set on 5782 papers on posttraumatic stress disorder. Of these papers, 38 were
included in the systematic review.

    "We performed a systematic search to identify longitudinal studies that applied LGMM,
    latent growth curve analysis, or hierarchical cluster analysis on symptoms of
    posttraumatic stress assessed after trauma exposure."

**Bayesian PTSD-Trajectory Analysis with Informed Priors Based on a Systematic Literature**
**Search and Expert Elicitation**
Rens van de Schoot, Marit Sijbrandij, Sarah Depaoli, Sonja D. Winter, Miranda Olff
& Nancy E. van Loey
https://doi.org/10.1080/00273171.2017.1412293

Data set publication: https://osf.io/h5k2q/

Name: ``example_ptsd``

Hall
~~~~
A data set on 8911 papers on fault prediction performance in software engineering. 
Of these papers, 104 were included in the systematic review. 

The data set results from

**How to Read Less: Better Machine Assisted Reading Methods for Systematic Literature Reviews.**
Yu, Zhe, Kraft, Nicholas, Menzies, Tim. (2016).  `arXiv:1612.03224v1 <https://www.researchgate.net/publication/311586326_How_to_Read_Less_Better_Machine_Assisted_Reading_Methods_for_Systematic_Literature_Reviews>`_

The original study can be be found here:

**A systematic literature review on fault prediction performance in software engineering**
T. Hall, S. Beecham, D. Bowes, D. Gray, S. Counsell, in IEEE Transactions on Software
Engineering, vol. 38, no. 6, pp. 1276-1304, Nov.-Dec. 2012. https://doi.org/10.1109/TSE.2011.103


Data set publication https://zenodo.org/record/1162952#.XiBgMi2ZNQK 

Name: ``example_hall``


Cohen
~~~~~
Data set from a project set up to test the performance of automated review systems such as
the ASReview project. The project includes several data sets from the medical sciences. 
The data set implemented in ASReview is the ``ACEInhibitors`` data set. 
Of the 2544 entries in the data set, 41 were included in the systematic review. 

**Reducing Workload in Systematic Review Preparation Using Automated Citation Classification**
A.M. Cohen, MD, MS, W.R. Hersh, MD, K. Peterson, MS, and Po-Yin Yen, MS. https://doi.org/10.1197/jamia.M1929

Name: ``example_cohen``

