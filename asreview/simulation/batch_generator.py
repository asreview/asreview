"""
Module that turns simulation propositions into batch scripts.
"""

import random
import os
from string import Template

import pandas as pd
import numpy as np
from sklearn.model_selection import ParameterGrid

from batchgen import batch_from_strings


def _create_df_parameter_grid(var_param, n_sample=None):
    " Create a parameter grid with or without sampling. "
    grid = ParameterGrid(var_param)
    grid = list(grid)

#   Sample the parameter grid and throw the rest away.
    if n_sample is not None:
        random.seed(9238752938)
        grid = random.sample(grid, n_sample)
    df = pd.DataFrame(grid)
    return df


def _create_df_fix_param(fix_param, n_sim):
    " Create a data frame for columns with fixed parameters. "
    df_args = pd.DataFrame()
    for key in fix_param:
        df_args[key] = np.tile(fix_param[key], n_sim)
    return df_args


def params_to_file(var_param, fix_param, param_file, n_sample=None):
    " Create and store a parameter grid to a file. "
    df_pg = _create_df_parameter_grid(var_param, n_sample=n_sample)
    df_args = _create_df_fix_param(fix_param, df_pg.shape[0])

    df_all = pd.concat([df_pg, df_args], axis=1)
    df_all.index.name = 'T'
    df_all.to_csv(param_file)

    return df_all


def _args_from_row(row, param_names, data_file, output_dir):
    """ From the row of the parameter data frame,
        create the command line arguments.
    """
    param_val = map(lambda p: ' --' + p + ' ' + "'" + str(getattr(row, p)) +
                    "'", param_names)
    param_val_all = " ".join(list(param_val))
    job_str = "'" + data_file + "'" + param_val_all
    job_str += " --log_file " + "\"${TMPDIR}\"/" + "'" + output_dir\
        + "/results" + str(getattr(row, "T")) + ".h5" + "'"
    return job_str


def commands_from_csv(data_file, param_file, output_dir="output"):
    """Create commands from a parameter (CSV) file.
       Arguments
       ---------
       data_file_path: str
           File with data to simulate.
       params_file_path: str
           File with parameter grid (CSV).
       config_file: str
       """
    params = pd.read_csv(param_file)
    base_job = "${python} -m asreview simulate "
    param_names_all = list(params.columns.values)
    param_names = [p for p in param_names_all if p not in ['T', 'simulation']]

    script = []
    for row in params.itertuples():
        args = _args_from_row(row, param_names, data_file, output_dir)
        job_str = base_job + args
        script.append(job_str)

    return script


def pre_compute_defaults(extra_config):
    """Definition of pre-compute commands

    Returns
    -------
    str:
        List of lines to execute before computation.
    """
    # check if results.h5 is a file or folder
    cwd = os.getcwd()
    config_file = extra_config["config_file"]
    output_dir = extra_config["output_dir"]
    mydef_str = """\
if [ "${backend}" == "slurm_lisa" ]; then
    module load eb
    module load Python/3.6.1-intel-2016b
fi

BASE_DIR=${cwd}
cd $BASE_DIR
source cpu-node/bin/activate
mkdir -p "${TMPDIR}"/${output_dir}
"""
    if config_file is not None:
        mydef_str += "cp $BASE_DIR/${config_file} ${TMPDIR}\n"
    mytempl = Template(mydef_str)
    mydef = mytempl.safe_substitute(cwd=cwd,
                                    config_file=config_file,
                                    output_dir=output_dir)
    return mydef


def post_compute_defaults(extra_config):
    """Definition of post-compute commands
    Returns
    -------
    str:
        List of lines to execute after computation.
    """
    output_dir = extra_config["output_dir"]
    mydef = Template('cp -r "${TMPDIR}"/${output_dir}  $BASE_DIR')
    mydef = mydef.safe_substitute(output_dir=output_dir)
    return mydef


def generate_shell_script(data_file, param_file, config_file, extra_config={}):
    """ Create job script(s) using the batchgen package.
    Arguments
    ---------
    data_file_path: str
        File with systematic review data.
    params_file_path: str
        File with parameter grid (CSV).
    config_file: str
        configuration information for the batch system
    """
    if "config_file" in extra_config:
        extra_config["output_dir"] = os.path.join(
            "output", extra_config["job_name"])
    else:
        extra_config["output_dir"] = "output"
        extra_config["config_file"] = None

    script = commands_from_csv(data_file,
                               param_file, extra_config["output_dir"])
    script_commands = "\n".join(script)

    pre_com_string = pre_compute_defaults(extra_config)
    post_com_string = post_compute_defaults(extra_config)

    batch_from_strings(command_string=script_commands, config_file=config_file,
                       pre_com_string=pre_com_string,
                       post_com_string=post_com_string,
                       force_clear=True,
                       extra_config=extra_config)


def batch_from_params(var_param, fix_param, data_file, embedding_file,
                      param_file, config_file, sample=None):
    " Create batch files using a pickle file directly. "

    extra_config = {}
    if "config_file" in fix_param:
        cfg_base = os.path.basename(fix_param["config_file"])
        base = os.path.splitext(cfg_base)[0]
        extra_config["job_name"] = "asr_"+base
        extra_config["config_file"] = fix_param["config_file"]

    " Create batch files using the original data/embedding files. "
#     if use_pickle:
#         data_file = write_pickle(data_file, embedding_file)
#     else:
    fix_param["embedding"] = embedding_file

    params_to_file(var_param, fix_param, param_file, sample)
    generate_shell_script(data_file, param_file, config_file, extra_config)
