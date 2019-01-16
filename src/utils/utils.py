
# Cpython dependencies
import os

# external dependencies
import numpy as np
import pandas as pd
import pickle

from sklearn.model_selection import train_test_split

# project dependencies
from utils.config import DATA_DIR, PTSD_PATH, DRUG_DIR, DEPRESSION_PATH

# PARAMETER_PATH = os.path.join(DATA_DIR, "parameters.txt")

def load_ptsd_data():
    """Load ptsd papers and their labels.

    The number of records is 5077. The following labels are included after the
    systematic review: 218,260,466,532,564,565,699,1136,1154,1256,1543,1552,19
    40,1960,1983,1984,1992,2005,2126,2477,2552,2708,2845,2851,3189,3280,3359,3
    361,3487,3542,3560,3637,3913,4048,4049,4145,4301,4334,4491,4636

    """

    # read the data of the file location given as argument to this function
    df = pd.read_csv(PTSD_PATH)

    # make texts and labels
    texts = (df['title'].fillna('') + ' ' + df['abstract'].fillna(''))
    labels = df["included_final"]

    return texts.values, labels.values


def load_drug_data(name):
    """Load drug datasets and their labels.

    params
    ------
    name: str
        The name of the dataset (should match with file name)
    """

    print("load drug dataset: {}".format(name))

    # create file path based on the argument name.
    fp = os.path.join(DRUG_DIR, name + ".csv")

    try:
        df = pd.read_csv(fp)
    except FileNotFoundError:
        raise ValueError("Dataset with name {} doesn't exist".format(name))

    # make texts and labels
    texts = (df['title'].fillna('') + ' ' + df['abstracts'].fillna(''))
    labels = (df["label2"] == "I").astype(int)

    print("number of positive labels: {}".format(labels.sum()))
    print("relative number of positive labels: {}".format(
        labels.sum() / labels.shape[0]))

    return texts.values, labels.values

def load_depression_data(sr_year=0):
    """Load adults_depression papers and their labels.
       This function load depression papers that published in the given year and earlier. 
    
        params
        ------
        sr_year: int
            The year in which systematic review is carried out.
            
        return
        ------
        texts: a list including title and abstract of papers
        labels: a list of labels
        train_index: index of papers that published before the given year
        test_index: index of papers that published whithin the given year
    """

    # read the data of the file
    df = pd.read_csv(DEPRESSION_PATH, encoding= "latin-1")
    
    if sr_year !=0:
        df['date']=list(map(int,df['date'])) #Convert type of 'date' to int
        df = df.loc[df['date']<=sr_year,:]
        train_index = np.where(df['date']<sr_year)[0]    
        test_index = np.where(df['date']==sr_year)[0]   
    
    # make texts and labels
    texts = (df['title'].fillna('') + ' ' + df['abstracts'].fillna(''))
    labels = df["label"]
    
    print('shape of label',df['label'].shape)
    return texts.values, labels.values, train_index, test_index

def list_drug_datasets():
    """Get a list of all available drug datasets."""

    return [dataset[:-4] for dataset in os.listdir(DRUG_DIR)]


def split_data(data, labels, train_size, init_positives): #, seed
    """split dataset to train and test datasets
    """
    if train_size >= len(data):
        print('invalid train size')
        return
     
    print('shape(data)',data.shape) 
    print('shape(labels)',labels.shape)
      
    
    # select init_positive cases from the entire dataset
    if init_positives > 0:
        ##index of all included papers in the entire dataset
        positive_indx = np.where(labels[:, 1] == 1)[0]

        #np.random.seed(seed)
        
        to_add_indx = np.random.choice(positive_indx, init_positives, replace=False)
        
        y_train_init = labels[to_add_indx]
        x_train_init = data[to_add_indx]
    
        indices_without_init = [idx for idx,val in enumerate(labels) if idx not in to_add_indx]
        

    train_size = train_size - init_positives
    validation_split = 1 - (train_size / len(data[indices_without_init])) #ratio of selecting test dataset

    print('train_size',train_size)
    print('len(data)',len(data[indices_without_init]))
    print('len(indices_without_init)',len(indices_without_init))
    # split data into train and test
    x_train, x_val, y_train, y_val,indices_train,indices_test = train_test_split(
        data[indices_without_init],
        labels[indices_without_init],
        indices_without_init,
        test_size=validation_split
        #random_state=seed
        #stratify=labels
    )

    ## add initially selected papers to train dataset
    x_train = np.vstack((x_train, x_train_init))
    y_train = np.vstack((y_train, y_train_init))

    print('to_add_indx',type(to_add_indx))
    print('indices_train',type(indices_train))
    
    indices_train = to_add_indx.tolist()+indices_train 
    return (x_train, x_val, y_train, y_val,indices_train,indices_test)


def split_data_iterative_sr(data, labels, train_index, test_index):
    """split dataset to train and test datasets
    """
     
    print('shape(data)',data.shape) 
    print('shape(labels)',labels.shape)
      
    x_train = data[train_index]
    x_val = data[test_index]
    y_train = labels[train_index]
    y_val = labels[test_index]
        
    return (x_train, x_val, y_train, y_val)

