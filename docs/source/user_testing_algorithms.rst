**# Install software**

The first step is to install [ASReveiw] (to
https://asreview.readthedocs.io/en/latest/installation.html) and to
create a [new project]
(https://asreview.readthedocs.io/en/latest/quicktour.html).

**# Upload a Dataset**

Select one of the three test-datasets (in the datasets we included a
label whether a paper has been included by the original authors so that
these abstract will appear in red and excluded abstract appear in black
during the screening phase):

1. The PTSD data containing the results of a systematic search for
   longitudinal studies that applied unsupervised machine learning
   techniques on longitudinal data of self-reported symptoms of
   posttraumatic stress assessed after trauma exposure
   (https://doi.org/10.1080/00273171.2017.1412293). The total number of
   papers found was 5,782 of which only 38 were included (0.66%);

2. Results for a systematic review by Hall et al. of studies on fault
   prediction in software engineering
   (`*10.1109/TSE.2011.103* <https://doi.org/10.1109/TSE.2011.103>`__ )
   with 8,911 papers of which 104 inclusions (1.17%);

3. Results for a systematic review on the efficacy of
   Angiotensin-converting enzyme (ACE) inhibitors, from a study
   collecting various systematic review datasets from the medical
   sciences
   (`*https://doi.org/10.1197/jamia.M1929* <https://doi.org/10.1197/jamia.M1929>`__)
   with 2,544 papers of which 41 inclusions (1.61%).

**# Provide Prior Inclusions**

In the next step you are asked to add prior inclusions. Select 2 papers
out of the following set by copy-pasting the title in the search bar.

PTSD:

+-----------------------------------------------------------------------------------------------------------------------------------------------------+
| Latent trajectories of trauma symptoms and resilience: the 3-year longitudinal prospective USPER study of Danish veterans deployed in Afghanistan   |
+=====================================================================================================================================================+
| A Latent Growth Mixture Modeling Approach to PTSD Symptoms in Rape Victims                                                                          |
+-----------------------------------------------------------------------------------------------------------------------------------------------------+
| Peace and War: Trajectories of Posttraumatic Stress Disorder Symptoms Before, During, and After Military Deployment in Afghanistan                  |
+-----------------------------------------------------------------------------------------------------------------------------------------------------+
| The relationship between course of PTSD symptoms in deployed U.S. Marines and degree of combat exposure                                             |
+-----------------------------------------------------------------------------------------------------------------------------------------------------+
| Trajectories of trauma symptoms and resilience in deployed US military service members: Prospective cohort study                                    |
+-----------------------------------------------------------------------------------------------------------------------------------------------------+

Hall:

+---------------------------------------------------------------------------------+
| Predicting Defect-Prone Software Modules at Different Logical Levels            |
+=================================================================================+
| Quantitative analysis of faults and failures in a complex software system       |
+---------------------------------------------------------------------------------+
| A Comprehensive Empirical Study of Count Models for Software Fault Prediction   |
+---------------------------------------------------------------------------------+
| Predicting fault prone modules by the Dempster-Shafer belief networks           |
+---------------------------------------------------------------------------------+
| Robust prediction of fault-proneness by random forests                          |
+---------------------------------------------------------------------------------+

ACE:

+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Quinapril in patients with congestive heart failure: controlled trial versus captopril.                                                                                                                                                                                                                                      |
+==============================================================================================================================================================================================================================================================================================================================+
| Clinical effects of early angiotensin-converting enzyme inhibitor treatment for acute myocardial infarction are similar in the presence and absence of aspirin: systematic overview of individual data from 96,712 randomized patients. Angiotensin-converting Enzyme Inhibitor Myocardial Infarction Collaborative Group.   |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Efficacy of different drug classes used to initiate antihypertensive treatment in black subjects: results of a randomized trial in Johannesburg, South Africa.                                                                                                                                                               |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Long-term mortality in patients with myocardial infarction: impact of early treatment with captopril for 4 weeks.                                                                                                                                                                                                            |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Comparison of perindopril versus captopril for treatment of acute myocardial infarction.                                                                                                                                                                                                                                     |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

**# Exclusions**

Exclude all five papers in step 4

**# START reviewing**

Start reviewing the first 50, 100 or even 200 papers. Abstracts in red
are one of the included papers and abstracts in black are exclusions.
Hint: open the statistics panel -> top right.

For the *PTSD* dataset we expect you to find about 7 out of 38 relevant
papers (in red) after screening 50 papers, 19 after screening 100 papers
and 36 after 200 papers.

For the *Hall* dataset we expect you to find 25 out of 104 relevant
papers (in red) after screening 50 papers, 48 after screening 100 papers
and 88 after 200 papers.

For the *ACE* dataset we expect you to find 16 out of 41 relevant papers
(in red) after screening 50 papers, 27 after screening 100 papers and 32
after 200 papers.

**# Export data**

Export the results (in the menu; top left) and open the file in excel.
The papers are now presented starting with your inclusions – unseen
papers papers ordered from most to least relevant according to the last
iteration of the software – your exclusions.

Congratulations! You succeeded in repeating the work of weeks in just a
couple of minutes (~crying~)

**# Questions**

-  Did you succeed in exporting the excel file?

-  How many relevant papers did you find in the set of 50, 100, 200
   papers?

-  Share your enthusiasm via social media and file issues via
   https://github.com/asreview/asreview or even better, help us to
   improve the code!
