##################
# make_sr_lstm_batch.R:
# 1) Makes N `bash` scripts. Each `bash` script runs a batch of M models/tasks with different parameter settings.
#    Total number of different settings is somewhere between (N-1 * M) and (N*M). Each script runs a chunk of P models in parallel.
#    After each chunk the next chunk is run till all the M models of the batch are done.
# 2) Makes a `bash` script to submit the above mentioned scripts to the scheduler of the system
#    
#
# 
#
#################

# initialising --------
library(dplyr, warn.conflicts = FALSE)
library(data.table, warn.conflicts = FALSE)


args = commandArgs(trailingOnly = TRUE)

if ((length(args) == 0)||(length(args) > 2)){
  stop("Arguments are not as expected!")
}else if (length(args) == 1){
  dataset = args[1]
  sr_iterative = FALSE #default value
}else{ #two arguments
  dataset = args[1]
  if (args[2]=='sr_itr'){
    sr_iterative = TRUE
  }else{
    sr_iterative = FALSE
  }
}

# create_batch: create a shell script for running M models on one node ----



create_batch <- function(node, script) {
  
  # SLURM commands to instruct the scheduler about the required resources
  
  fbatch     <- file(script, open= "w")
  writeLines("#!/bin/bash", fbatch)
  
  #writeLines("#SBATCH -S /bin/bash", fbatch)
  sbatch_walltime <- sprintf("#SBATCH -t %s", wall_time)
  writeLines(sbatch_walltime, fbatch)
  writeLines("#SBATCH --tasks-per-node=15", fbatch)
  sbatch_jobname <- sprintf("#SBATCH -J %s", basename)
  writeLines(sbatch_jobname, fbatch)
  
  # Shell commands to set working directory and to copy data and scripts to
  # the /scratch ($TMPDIR) of the node
  
  writeLines("cd $HOME/asr", fbatch)
  writeLines("mkdir -p \"$TMPDIR\"/output", fbatch)
  writeLines("cp -r $HOME/asr/data_tmp \"$TMPDIR\"", fbatch)
  writeLines("cp -r $HOME/asr/hpc \"$TMPDIR\"", fbatch)
  writeLines("cp -r $HOME/asr/src \"$TMPDIR\"", fbatch)
  
  writeLines("cd \"$TMPDIR\"", fbatch)
  
  # Load the software to run the scripts
  #
  writeLines("module load eb", fbatch)
  writeLines("module load python/3.5.0-intel", fbatch)
  
  
  # The node number and tasks/model per node determines the batch that will be run on this node
  start_batch <- ((node-1) * task_per_node) + 1
  end_batch   <- node * task_per_node
  for (i in start_batch:end_batch) {
	      if (i > n_task ) break                # Last batch can contain less than M tasks
      
        # construct command line to run a specific model/task
        if (sr_iterative){
              arg_line <- sprintf("-T %s  --dropout %s --dataset %s",
                                  task_params$T[i],
                                  task_params$dropout[i],
                                  task_params$dataset[i])
          
        }else{
              arg_line <- sprintf("-T %s --training_size %s  --init_included_papers %s --dropout %s --dataset %s",
                                  task_params$T[i],
                                  task_params$training_size[i],
                                  task_params$init_included_papers[i],
                                  task_params$dropout[i],
                                  task_params$dataset[i])
          
        }

    command  <- sprintf("python3 ./src/systematic_review_passive.py  %s &> /dev/null &", arg_line)
    
    writeLines(command, fbatch)
    writeLines("sleep 1", fbatch)                          # to prevent processes to access resources at the same time
    
    # to allow only `proces_per_node` processes in parallel check wether we have to wait
    
    if (((i - start_batch + 1) %% proces_per_node) == 0) {
      writeLines("wait", fbatch)
    }
  }
  writeLines("wait", fbatch)
  
  # copy the output back to the HOME of the user and notify user 
  # the job has ended
  #
  
  writeLines("cp -r \"$TMPDIR\"/output  $HOME/asr", fbatch)
  #writeLines("echo \"Job $SLURM_JOBID ended at `date`\" | mail $USER -s \"Job: $SLURM_JOBID\"", fbatch)
  
  writeLines("date", fbatch)
  close(con= fbatch)
  Sys.chmod(script, mode = "0700")     # set execution permission on the script
}

# domain specific part ----

basename <- dataset

batch_dir = file.path(getwd(),'batch_files','passive',dataset)
if (!dir.exists(batch_dir))
  dir.create(batch_dir, recursive = TRUE)

batch_dir_rel=file.path('.','batch_files','passive',dataset)

# Creates Join (CJ) with all the different parameter settings
if (sr_iterative){
    task_params <- data.table::CJ(sample =               as.character(1:50),
                                  dropout = 	           c("0.4"))
                                  
}else{
    task_params <- data.table::CJ(sample =               as.character(1:50),
                                  training_size =        as.character(seq(20, 500, 40)),
                                  dropout = 	           c("0.4"),
                                  init_included_papers = c("10"))
    
}

# Each task/model gets a number which will be used in the file name of the output of the model

task_params <- task_params %>% mutate(dataset =  dataset) %>%
                               mutate(T = 0:(nrow(task_params)-1)) %>%
                               select(-sample)

# Save the parameter setting of each task

task_params_file <- file.path(batch_dir, sprintf("%s_params.csv", dataset))
write.csv(x = task_params, file = task_params_file)

if (sr_iterative){
    # Calculate the number of nodes
    proces_per_node   <- 15                             # number of parallel processes on a node a.k.a. chunk
    task_per_node     <- 15
    minutes_per_task  <- 200  # see XXX for how to determine this value (to do)
}else{
    # Calculate the number of nodes
    proces_per_node   <- 15                             # number of parallel processes on a node a.k.a. chunk
    task_per_node     <- 75
    minutes_per_task  <- 45  # see XXX for how to determine this value (to do)
}


n_task            <- nrow(task_params)
n_nodes           <- ceiling(n_task/task_per_node)  # number of nodes

# Calculate the wall time: the time each job will take
minutes_per_job   <- ceiling(task_per_node/proces_per_node) * minutes_per_task
hours_wall        <- minutes_per_job %/% 60
minutes_wall      <- minutes_per_job %% 60
wall_time         <- sprintf("%02d:%02d:00", hours_wall, minutes_wall)

# Create submission script (2)
submit_script <- file.path(batch_dir, sprintf("submit_%s.sh", basename))
fsubmit       <- file(submit_script, open= "w")
writeLines("#!/bin/bash", fsubmit)

for (i in 1:n_nodes) {
      #
      # Create a batch script for each node
      #
  batch_script <- file.path(batch_dir, sprintf("%s_%d.sh", basename, i))
  create_batch(node = i, script = batch_script)
  sbatch <- sprintf("sbatch  %s/%s_%d.sh", batch_dir_rel,basename, i)   # submission command for this batch
  writeLines(sbatch, fsubmit)
}
close(con= fsubmit)
Sys.chmod(submit_script, mode = "0700")   # set execution permission on the script for user
