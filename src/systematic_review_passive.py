# Systematic Review with LSTM Passive
#
# Arguments:
#     -T: Task number
#     --training_size: Size of training dataset
#     --init_included_papers: Initial number of included papers
#     --dataset: Name of dataset
#     --dropout: Ratio of NN units to drop out
#
# Authors: Parisa Zahedi, Jonathan de Bruin

import os
import argparse
import pandas as pd

from models.lstm import LSTM_Model
from utils.utils import *
from utils.config import *

# parse the arguments
parser = argparse.ArgumentParser(description='Systematic Review options')

""" Task number """
parser.add_argument("-T", default=1, type=int, help='Task number.')

""" Size of training dataset """
parser.add_argument(
    "--training_size", default=50, type=int, help='Size of training dataset')

""" The number of papers that are initially included """
parser.add_argument(
    "--init_included_papers",
    default=10,
    type=int,
    help='Initial number of included papers')
    
""" Dataset name """    
parser.add_argument(
    "--dataset", default='ptsd', type=str, help='Name of dataset')

""" Dropout """
parser.add_argument(
    "--dropout", default=0.4, type=float, help='dropout')
sr_args = parser.parse_args()
print(sr_args)


#seed_val = 2017 + int(sr_args.T)  #Set seed

""" Read dataset, labels and embedding layer from pickle file. """
pickle_fp = os.path.join(TEMP_DATA_DIR, sr_args.dataset, sr_args.dataset + '_pickle.pickle')
with open(pickle_fp, 'rb') as f:
    data, labels, embedding_layer, indices_train, indices_test = pickle.load(f)
    
""" Split dataset to train and test """
if sr_args.dataset=='depression': #Split train/test for depression dataset. It is an iterative systematic review. 
    x_train, x_val, y_train, y_val =split_data_iterative_sr(data, labels, indices_train, indices_test)

else:

    x_train, x_val, y_train, y_val,indices_train,indices_test = split_data(
        data, labels, sr_args.training_size, sr_args.init_included_papers
        ) #seed_val
    print("x_train shape:", x_train.shape, ", x_val shape:", x_val.shape)
    print("y_train shape:", y_train.shape, ", y_val shape:", y_val.shape)
    print("included in train", (y_train[:, 1] == 1).sum())
    print("included in test", (y_val[:, 1] == 1).sum())

""" Make a lstm model """
deep_model = LSTM_Model
args_model = {
    'backwards': True,
    'dropout': sr_args.dropout,
    'optimizer': 'rmsprop',
    'max_sequence_length': 1000,
    'embedding_layer': embedding_layer
}

""" Train model, calculate scores"""
model = deep_model(**args_model)
model.train(x_train, y_train, x_val, y_val)

result_df = pd.DataFrame({'label': labels[:,1]})

pred = model.predict(x_val)

# store result in dataframe
c_name = 'pred'
result_df[c_name] = -1
result_df.loc[indices_test, c_name] = pred[:, 1]


"""Save the result to a file"""
output_dir = os.path.join(PASSIVE_OUTPUT_DIR, sr_args.dataset)
if not os.path.exists(output_dir):
        os.makedirs(output_dir)
export_path = os.path.join(output_dir, 'dataset_{}_sr_lstm{}_included_papers{}_training_size{}_dropout{}.csv'.format(sr_args.dataset, sr_args.T,sr_args.init_included_papers,sr_args.training_size,sr_args.dropout))
result_df.to_csv(export_path)