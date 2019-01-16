##################
# make_sr_lstm_batch.R:
# 1) Makes N `bash` scripts. Each `bash` script runs a batch of M models/tasks with different parameter settings.
#    Total number of different settings is somewhere between (N-1 * M) and (N*M). Each script runs a chunk of P models in parallel.
#    After each chunk the next chunk is run till all the M models of the batch are done.
# 2) Makes a `bash` script to submit the above mentioned scripts to the scheduler of the system

#################

# initialising --------
library(dplyr, warn.conflicts = FALSE)
library(data.table, warn.conflicts = FALSE)


args = commandArgs(trailingOnly = TRUE)

if (length(args) != 1){
  stop("Arguments are not as expected")
}else{
  dataset = args[1]
}

# create_batch: create a shell script for running M models on one node ----

 create_batch <- function(node, script) {
    
  # PBS commands to instruct the scheduler about the required resources
  #
    fbatch     <- file(script, open= "w")
    writeLines("#!/bin/bash", fbatch)
    
    #writeLines("#SBATCH -S /bin/bash", fbatch)
    sbatch_walltime <- sprintf("#SBATCH -t %s", wall_time)
    writeLines(sbatch_walltime, fbatch)
    writeLines("#SBATCH --tasks-per-node=15", fbatch)
    sbatch_jobname <- sprintf("#SBATCH -J %s", basename)
    writeLines(sbatch_jobname, fbatch)

  #  writeLines("#SBATCH --mail-type=BEGIN,END", fbatch)
 #   writeLines("#SBATCH --mail-user=p.zahedi@uu.nl", fbatch)    
    
    
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
  #
    start_batch <- ((node-1) * task_per_node) + 1
    end_batch   <- node * task_per_node
    for (i in start_batch:end_batch) {
	      if (i > n_task ) break                # Last batch can contain less than M tasks
      
        # construct command line to run a specific model/task
      
        arg_line <- sprintf("-T %s --quota %s --dataset %s --query_strategy %s --init_included_papers %s --batch_size %s",
                            task_params$T[i],
                            task_params$quota[i],
                            task_params$dataset[i],
                            task_params$query_strategy[i],
                            task_params$init_included_papers[i],
                            task_params$batch_size[i])
        
        command  <- sprintf("python3 ./src/systematic_review_active.py  %s &> /dev/null &", arg_line)
        
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
    writeLines("echo \"Job $SLURM_JOBID ended at `date`\" | mail $USER -s \"Job: $SLURM_JOBID\"", fbatch)
    
    writeLines("date", fbatch)
    close(con= fbatch)
    Sys.chmod(script, mode = "0700")     # set execution permission on the script
}

# domain specific part ----

basename <- dataset

batch_dir = file.path(getwd(),'batch_files','active_learning',dataset)
if (!dir.exists(batch_dir))
  dir.create(batch_dir, recursive = TRUE)

batch_dir_rel=file.path('.','batch_files','active_learning',dataset)

# Creates Join (CJ) with all the different parameter settings

task_params <- data.table::CJ(sample =        as.character(1:50),
                              quota  =        as.character(12),
                              init_included_papers =as.character(c(10)),
                              query_strategy = c('random','lc','lcbmc'),
                              batch_size=40)

# Each task/model gets a number which will be used in the file name of the output of the model

task_params <- task_params %>% mutate(dataset =  dataset) %>%
                               mutate(T = 0:(nrow(task_params)-1)) %>%
                               select(-sample)

# Save the parameter setting of each task
task_params_file <- file.path(batch_dir, sprintf("%s_params.csv", dataset))
write.csv(x = task_params, file = task_params_file)

# Calculate the number of nodes
proces_per_node   <- 15                             # number of parallel processes on a node a.k.a. chunk

task_per_node     <- 15
minutes_per_task  <- 170  # see XXX for how to determine this value (to do)

n_task            <- nrow(task_params)
n_nodes           <- ceiling(n_task/task_per_node)  # number of nodes
n_task_last_node  <- n_task%%task_per_node

    # Calculate the wall time: the time each job will take
    #
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
    if ((i==n_nodes)&(n_task_last_node !=0)){
      sbatch <- sprintf("sbatch  %s/%s_%d.sh", batch_dir_rel,basename, i)   # submission command for this batch
    }else{
      sbatch <- sprintf("sbatch  %s/%s_%d.sh", batch_dir_rel,basename, i)   # submission command for this batch
    }
    
    writeLines(sbatch, fsubmit)
}
close(con= fsubmit)
Sys.chmod(submit_script, mode = "0700")   # set execution permission on the script for user
