#!/usr/bin/env python3
# Systematic Review with LSTM Active
#
# Arguments:
#     -T: Task number
#     --dataset: Name of dataset
#     --quota: The number of queries
#     --init_included_papers: Initial number of included papers
#     --batch_size : Batch size
#     --model: A deep learning model to use for classification.
#     --query_strategy: "The query strategy"
#     --dropout: Ratio of NN units to drop out
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import os
import argparse


import numpy as np
import pandas as pd

from models.lstm import LSTM_Model
from query_strategies.uncertainty_sampling import UncertaintySampling
from query_strategies.random_sampling import RandomSampling
from query_strategies.model_change_sampling import ModelChangeSampling

# demo utils
from utils.utils import *
from utils.config import *
from base.dataset import *

from select_init_indices import *

# parse arguments if available
parser = argparse.ArgumentParser(description='Active learning parameters')

""" Task number """
parser.add_argument("-T", default=1, type=int, help='Task number.') 

""" Database name """
parser.add_argument(
    "--dataset",
    type=str,
    default='ptsd',
    help="The dataset to use for training.")

""" The number of iteration """
parser.add_argument(
    "--quota", type=int, default=10, help="The number of queries")

""" The initial number of included papers """
parser.add_argument(
    "--init_included_papers",
    default=10,
    type=int,
    help='Initial number of included papers')

""" The number of papers that is labeled for each iteration """
parser.add_argument(
    "--batch_size",
    default=10,
    type=int,
    help='Batch size')

""" Machine learninng model """
parser.add_argument(
    '--model',
    type=str,
    default='LSTM',
    help="A deep learning model to use for classification.")
    
""" Query strategy """    
parser.add_argument(
    "--query_strategy", type=str, default='lc', help="The query strategy")

""" Dropout """
parser.add_argument(
    "--dropout", default=0.4, type=float, help='dropout')

parser.add_argument(
  "--init_indices", type=bool, default=True)


def make_pool(X, y, prelabeled=np.arange(5)):
    """Function to split dataset into train and test dataset.

    Arguments
    ------

    prelabeled: list
        List of indices for which the label is already available.

    """
    y = y.argmax(axis=1)
    # a set of labels is already labeled by the oracle
    y_train_labeled = np.array([None] * len(y))
    
    y_train_labeled[prelabeled] = y[prelabeled]

    # we are making a pool of the train data
    # the 'prelabeled' labels of the dataset are already labeled.
    return Dataset(X, y_train_labeled), Dataset(X, y)


def main(args):
    
    # Read dataset, labels and embedding layer from pickle file.
    pickle_fp = os.path.join(TEMP_DATA_DIR,args.dataset, args.dataset + '_pickle.pickle')
    with open(pickle_fp, 'rb') as f:
        data, labels, embedding_layer, _, _ = pickle.load(f)

    # label the first batch (the initial labels)
    # To compare different query strategies we need a fixed set of prelabeled papers. To do so:
    # By default prelabeled_indexes are read from prelabeled_indices.csv
    # if args.init_indices == False then the list of prelabled_indices are generated here.
    
    #seed = 2017 + args.T
    
    if  args.init_indices == False:
        prelabeled_index= select_prelabeled(labels, args.init_included_papers) #seed
    else:
        labeled_indices_fp = os.path.join(TEMP_DATA_DIR,args.dataset, args.dataset + '_prelabeled_indices.csv')
        prelabeled_data =pd.read_csv(labeled_indices_fp,names=['idx'])
        prelabeled_index = prelabeled_data.idx.tolist()
            
    print('prelabeled_index', prelabeled_index)
    pool, pool_ideal = make_pool(data, labels, prelabeled=prelabeled_index)

    # get the model
    if args.model.lower() == 'lstm':
        deep_model = LSTM_Model
        kwargs_model = {
            'backwards': True,
            'dropout': args.dropout,
            'optimizer': 'rmsprop',
            'max_sequence_length': 1000,
            'embedding_layer': embedding_layer
        }
    else:
        raise ValueError('Model not found.')

    # np.random.seed(seed)
    # tf.set_random_seed(seed)

    model = deep_model(**kwargs_model)
    #init_weights = model._model.get_weights()

    result_df = pd.DataFrame({'label': [x[1] for x in pool_ideal.data]})
    query_i = 0

    #prev_model is used for model change sampling
    prev_score = np.array([])
    while query_i <= args.quota:

        # make a query from the pool
        print("Asking sample from pool with %s" % args.query_strategy)

        # np.random.seed(seed)
        # tf.set_random_seed(seed)

        model = deep_model(**kwargs_model)
        # train the model
        model.train(pool)

        # predict the label of the unlabeled entries in the pool
        idx_features = pool.get_unlabeled_entries()
        idx = [x[0] for x in idx_features]
        features = [x[1] for x in idx_features]
        pred = model.predict(features)

        # store result in dataframe
        c_name = str(query_i)
        result_df[c_name] = -1
        result_df.loc[idx, c_name] = pred[:, 1]

        # make query
        if (args.query_strategy == 'lc'):
            qs = UncertaintySampling(
                pool, method='lc', model=model)
        elif (args.query_strategy == 'random'):
            qs = RandomSampling(pool)

        elif (args.query_strategy == 'lcb'):
            qs = UncertaintySampling(
                pool, method='lcb', model=model)

        elif (args.query_strategy == 'lcbmc'):
            qs = ModelChangeSampling(
                pool, method='lcbmc', model=model, prev_score=prev_score)
        ask_id = qs.make_query(n=args.batch_size)

        
        if not isinstance(ask_id, list):
            ask_id = [ask_id]

        if (args.query_strategy == 'lcbmc'):
              
            prev_score = np.array([qs.score[i] for i,x in enumerate(idx) if x not in ask_id])
            print('prev_score shape', prev_score.shape)
            print('idx', len(idx))
            print('prev_score', prev_score)
         
                                       
        for i in ask_id:
            lb = int(labels[i][1])
            pool.update(i, lb)

        
        # reset the memory of the model
        #model._model.set_weights(init_weights)

        # update the query counter
        query_i += 1

    # save the result to a file
    output_dir = os.path.join(ACTIVE_OUTPUT_DIR, args.dataset)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    export_path = os.path.join(
        output_dir, 'dataset_{}_systematic_review_active{}_q_{}.csv'.format(
            args.dataset, args.T, args.query_strategy))

    result_df.to_csv(export_path)
    input("Press any key to continue...")


if __name__ == '__main__':

    # parse all the arguments
    args = parser.parse_args()

    try:
        # start the active learning algorithm
        main(args)
    except KeyboardInterrupt:
        print('Closing down.')
