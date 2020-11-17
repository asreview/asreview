Exploration Mode
================

This tutorial shows how the active learning software and the performance of
:ref:`different algorithms <feature-extraction-table>` can be explored on
already labeled data. In this mode relevant articles are displayed in green
and a so-called recall curce can be obtained.

This tutorial assumes you have already installed Python and ASReview. If this
is not the case, see :doc:`../intro/installation`. Also, you should
have created a :doc:`project<launch>` - the name is not
relevant, but is adviced to have a test-prefix.


Upload Data for Exploration Mode
--------------------------------

You can explore a previously labeled dataset in ASReview LAB by adding an
extra column called ‘debug_label’ to your dataset. This column should indicate
the relevant (1) and irrelevant (0) records. The relevant records will show up
green during screening.

1. Open ASReview LAB.
2. Start a new project.
3. Click the *Start Setup* button.
4. Select your labeled dataset containing the ‘debug_label’.


[SCREENSHOT]


Upload a Built-in dataset
-------------------------

Select one of the three :ref:`test-datasets <demonstration-datasets>` available. The datasets
available are PTSD, Hall and AceInhibitors:

1. The PTSD data containing the results of a systematic search for
   longitudinal studies that applied unsupervised machine learning
   techniques on longitudinal data of self-reported symptoms of
   posttraumatic stress assessed after trauma exposure
   (https://doi.org/10.1080/00273171.2017.1412293). The total number of
   papers found was 5,782 of which only 38 were included (0.66%);

2. Results for a systematic review by Hall et al. of studies on fault
   prediction in software engineering
   (`10.1109/TSE.2011.103 <https://doi.org/10.1109/TSE.2011.103>`__ )
   with 8,911 papers of which 104 inclusions (1.17%);

3. Results for a systematic review on the efficacy of
   Angiotensin-converting enzyme (ACE) inhibitors, from a study
   collecting various systematic review datasets from the medical
   sciences
   (`https://doi.org/10.1197/jamia.M1929 <https://doi.org/10.1197/jamia.M1929>`__)
   with 2,544 papers of which 41 inclusions (1.61%).

[SCREENSHOT]


Prior Inclusions
----------------

In the next step, you are asked to add prior inclusions. Select two (or more)
papers of your choice and copy-paste the title in the search bar. For the test
datasets you can use the following titles of papers:

PTSD:

- Latent trajectories of trauma symptoms and resilience: the 3-year longitudinal prospective USPER study of Danish veterans deployed in Afghanistan
- A Latent Growth Mixture Modeling Approach to PTSD Symptoms in Rape Victims
- Peace and War: Trajectories of Posttraumatic Stress Disorder Symptoms Before, During, and After Military Deployment in Afghanistan
- The relationship between course of PTSD symptoms in deployed U.S. Marines and degree of combat exposure
- Trajectories of trauma symptoms and resilience in deployed US military service members: Prospective cohort study


Hall:

- Predicting Defect-Prone Software Modules at Different Logical Levels
- Quantitative analysis of faults and failures in a complex software system
- A Comprehensive Empirical Study of Count Models for Software Fault Prediction
- Predicting fault prone modules by the Dempster-Shafer belief networks
- Robust prediction of fault-proneness by random forests


ACE:

- Quinapril in patients with congestive heart failure: controlled trial versus captopril.
- Clinical effects of early angiotensin-converting enzyme inhibitor treatment for acute myocardial infarction are similar in the presence and absence of aspirin: systematic overview of individual data from 96,712 randomized patients. Angiotensin-converting Enzyme Inhibitor Myocardial Infarction Collaborative Group.
- Efficacy of different drug classes used to initiate antihypertensive treatment in black subjects: results of a randomized trial in Johannesburg, South Africa.
- Long-term mortality in patients with myocardial infarction: impact of early treatment with captopril for 4 weeks.
- Comparison of perindopril versus captopril for treatment of acute myocardial infarction.


Prior Exclusions
----------------

Mark five papers as irrelevant.


START reviewing
---------------

Start reviewing the first 50, 100 or even 200 papers. Abstracts in green are
relevenant papers and abstracts in black are irrelevant. This is based on a
fully labeled dataset.

For the **PTSD** dataset we expect you to find about 7 out of 38 relevant
papers (in red) after screening 50 papers, 19 after screening 100 papers
and 36 after 200 papers.

For the **Hall** dataset we expect you to find 25 out of 104 relevant
papers (in red) after screening 50 papers, 48 after screening 100 papers
and 88 after 200 papers.

For the **ACE** dataset we expect you to find 16 out of 41 relevant papers
(in red) after screening 50 papers, 27 after screening 100 papers and 32
after 200 papers.



Results
-------

For all three datasets, the animated plots below show how fast you can find
the relevant papers by using ASReview LAB compared to random screening papers
one by one. These animated plots are all based on a single trial per dataset
in which only one paper was added as relevant and one as irrelevant.

PTSD:

38 inclusions out of 5,782 papers

.. figure:: ../../images/gifs/ptsd_recall_slow_1trial_fancy.gif
   :alt: Recall curve for the ptsd dataset

Hall:

104 inclusions out of 8,911 papers)

.. figure:: ../../images/gifs/software_recall_slow_1trial_fancy.gif
   :alt: Recall curve for the software dataset


ACE:

41 inclusions out of 2,544 papers

.. figure:: ../../images/gifs/ace_recall_slow_1trial_fancy.gif
   :alt: Recall curve for the ACE dataset
