# Analysis on ASR (outdated)

Description of the project

## Active and Passive learning research

Create a pickle file with the data, labels and embedding layer with the
following shell command:  

``` bash
python hpc/data_prep.py --dataset=ptsd
```


### Passive learning
``` 
python hpc/sr_lstm.py --training_size=500
```

### Active learning 

```
python hpc/sr_lstm_active.py
```



## Run simulations on HPC


### STEP 0: Setup configuration SurfSara

This sections contains an experiment to run a supervised learning simulation
on the SurfSara HPC infrastructure.


``` bash
module load eb
module load R
module load python/3.5.0-intel
```

Install dependencies:
```bash 
pip install --user git+https://github.com/J535D165/libact-lite
```

### STEP 1: generate batch files

Generate the batch files for active learning, use the following command:

``` bash
Rscript hpc/make_sr_lstm_batch.R [DATASET_NAME] --active
```

and for passive learning the following command:

``` bash
Rscript hpc/make_sr_lstm_batch.R [DATASET_NAME] --no-active
```

Working example: 

``` bash
Rscript hpc/make_sr_lstm_batch.R ptsd --active
```


### STEP 2: prepare datasets [Locally]

To speed up the computations on the HPC, several Python objects are generated
beforehand and stored in a pickle file. This file makes it possible to load
the objects really fast on each core on the HPC cluster.

Create a pickle file with the data, labels and embedding layer with the
following shell command:  

``` bash
python hpc/data_prep.py --dataset=ptsd
```

Run the command locally, such that you do not have to upload the entire word 
embedding (`wiki.vec`) to the HPC cluster. After running this, upload the pickle
files to the cluster. 

### STEP 3: start simulation

Submit the jobs with: 

```bash
source batch_files/active_learning_ptsd_submit_ptsd.sh
```

Check the status of the job:

```bash 
checkjob [JOB_ID]
```




