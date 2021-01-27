# State File Schematics
A schematic description of each of the different state files.

- The JSON state has the software version saved, HDF5 does not.
- The biggest part of the file size comes from the feature matrix and the probabilities matrix. These grow quadratic in 
size, the others linear.
- In prototype, time is the time of the labelling of the sample. Times related to model training would be interesting 
as well.
- In prototype, all similar data is saved together in one dataset. This makes the file quite a bit smaller, even if you 
save all probabilities, the file is twice as small as the normal HDF5 state file. The downside is that you need to be 
careful with bookkeeping which entries of the dataset refer to priors.

## JSON
```
JSONState --- pred_proba    (ndarray: last predicted probabilities)
           |- read_only     (bool:)
           |- settings      (ASReviewSettings: Described seperately)
           |- state_fp      (str: filepath)
           |- version       (str: Version of state file)
           |- _state_dict --- time --- start_time   (str: Time state file was created)
                (dict)     |        |- end_time     (str: Time state file was last closed)
                           |- version               (str: state_file version)
                           |- software_version      (str: ASReview version)
                           |- settings              (dict: contains the same info as the ASReviewSettings object)
                           |- results ----  0  --- labelled     (list: index, label, method='initial' for each prior)
                           |  (list)   |--  1  --- pool_idx     (list: indices not yet labelled)
                           |           | (dict) |- train_idx    (list: indices already labelled)
                           |           |        |- proba        (list: probabilities after previous query)
                           |           |        |- labelled     (list: [index, label, method] for new query)
                           |           |--  2  --- ... 
                           |           |- ...
                           |- labels    (list: all labels)
                           |- data_properties --- hash --- record_table     (list: id's)
                           |      (dict)         (dict) |- feature_matrix   (str: Base64 encoding of matrix)
                           |                            |- matrix_type      (str: 'csr_matrix')
                           |- current_queries   (dict: easy access to current query)
```

# HDF5State
In an HDF5 file, the data is stored in HDF5 datasets, which are very similar to numpy arrays. They are organised by 
using groups, which gives it a structure pretty much like a python dictionary. Every group or dataset can have 
attributes, which are small pieces of data which relate closely to the corresponding group or dataset.
```
HDF5State --- pred_proba    (ndarray: last predicted probabilities)
           |- read_only     (bool:)
           |- settings      (ASReviewSettings: Described seperately)
           |- state_fp      (str: filepath)
           |- version       (str: Version of state file)
           |- f --- attrs --- current_queries   (str: easy acces to current query)
      (HDF5 file)|         |- start_time        (str: Time state file was created)
                 |         |- end_time          (str: Time state file was last closed)
                 |         |- version           (str: state_file version)
                 |         |- settings          (json'ed dict: contains the same info as the ASReviewSettings object)
                 |- labels  (dtype <i4: all labels)
                 |- results --- 0 --- attrs --- creation_time   (str: time of creation of query group)
                 |           |     |- new_labels --- idx        (dtype <i4: index of priors)
                 |           |                    |- labels     (dtype <i4: labels of priors)
                 |           |                    |- methods    (dtype|S20: 'initial')
                 |           |- 1 --- attrs --- creation_time
                 |           |     |- new_labels --- idx        (dtype <i4: index)
                 |           |     |              |- labels     (dtype <i4: labels)
                 |           |     |              |- methods    (dtype|S20: method ('max'))
                 |           |     |- pool_idx                  (dtype <i4: indices not yet labelled)
                 |           |     |- train_idx                 (dtype <i4: indices already labelled)
                 |           |     |- proba                     (dtype <f8: probabilities after previous query)
                 |           |- 2 --- ...
                 |           |- ...
                 |- data_properties --- hash --- attrs --- matrix_type  (str: csr_matrix)
                                              |- data           (dtype <f8: These datasets can recreate a scipy sparse matrix)
                                              |- indices        (dtype <i4)
                                              |- indptr         (dtype <i4)
                                              |- record_table   (dtype <i8)
                                              |- shape          (dtype <i4)
```

## Prototype
Note that the prototype state does not yet have a wrapper around the actual data, like the other state files do.
```
ProtoState --- attrs --- current_queries    (str: easy acces to current query)
(HDF5 file) |         |- start_time         (str: Time state file was created)
            |         |- end_time           (str: Time state file was last closed)
            |         |- version            (str: state_file version)
            |         |- settings           (json'ed dict: contains the same info as the ASReviewSettings object)
            |- results --- attrs --- n_priors   (int)
            |           |- indices              (dtype <i4: All labelled indices in order. First n_priors are the prior ones)
            |           |- labels               (dtype <i4: All labels in order. First n_priors are the prior ones)
            |           |- models_training      (dtype |S6: Models being trained right after labeling a sample)
            |           |- predictor_model      (dtype |S7: Model that predicted the sample)
            |           |- predictor_methods    (dtype |S7: Prediction method for sample)
            |           |- time                 (dtype |S29: Time at which the sample was labelled)
            |           |- custom --- probabilities_column_index    (dtype <i4: Indices where probabilties where saved)
            |                      |- probabilities_matrix          (dtype <f8: Probabilities matrix)
            |- data_properties --- hash --- attrs --- matrix_type   (str: csr_matrix)
                                              |- data           (dtype <f8: These datasets can recreate a scipy sparse matrix)
                                              |- indices        (dtype <i4)
                                              |- indptr         (dtype <i4)
                                              |- record_table   (dtype <i8)
                                              |- shape          (dtype <i4)
```****