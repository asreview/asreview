#!/usr/bin/env python3

import os
import numpy as np
import argparse
import pickle

from asr.utils.config import *

# parse arguments if available
parser = argparse.ArgumentParser(description='Dataset preparation')
""" Database name """
parser.add_argument(
    "--dataset",
    type=str,
    default='ptsd',
    help="The dataset to use for training.")

""" The initial number of included papers """
parser.add_argument(
    "--init_included_papers",
    default=10,
    type=int,
    help='Initial number of included papers')


def select_prelabeled(labels, init_included):

    # index of included papers
    included_indexes = np.where(labels[:, 1] == 1)[0]
    # index of excluded papers
    excluded_indexes = np.where(labels[:, 1] == 0)[0]

    # select the minimum number that should be selected
    included_number = min(init_included, len(included_indexes))

    # select randomly from included papers
    to_add_indx = np.random.choice(
        included_indexes, included_number, replace=False)

    # non-selected included papers
    inc_rest = [x for x in included_indexes if x not in to_add_indx]

    # all non-selected indexes
    non_selected_index = np.append(excluded_indexes, inc_rest)

    #select a sample of init_included papers from non-selected indexes - to get a balanced set
    to_add_indx = np.append(
        to_add_indx,
        np.random.choice(non_selected_index, included_number, replace=False))

    return to_add_indx


if __name__ == '__main__':

    # parse all the arguments
    args = parser.parse_args()
    
    # Read dataset, labels and embedding layer from pickle file.
    pickle_fp = os.path.join(TEMP_DATA_DIR,args.dataset, args.dataset + '_pickle.pickle')
    with open(pickle_fp, 'rb') as f:
        data, labels, embedding_layer, _, _ = pickle.load(f)

    # label the first batch (the initial labels)
    #seed = 2017 + args.T
    prelabeled_index = select_prelabeled(labels, args.init_included_papers) #seed
    
    np.savetxt(os.path.join(TEMP_DATA_DIR, args.dataset, args.dataset + '_prelabeled_indices.csv'), prelabeled_index, fmt='%i', delimiter=',')
    
