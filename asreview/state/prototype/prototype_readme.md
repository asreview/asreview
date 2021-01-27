# Prototype of new state file
This contains code to produce a prototype of the new type of the state file from an original '.h5' state 
file. The goal of the prototype is to have a 'basic' version, that contains all the absolutely necessary 
information, and is as small as possible. There is also the option to save extra data, but this will also
mean the state file becomes larger. Ideally this extra data is saved in a dynamic way, so that the user 
can choose approximately how big the state file will become.

## Structure
The state file has three parts: 'data_properties', 'settings' and 'results'. In the 'data_properties' part
will be all information on the dataset. This is the same as for the original '.h5' state. In 'settings' we
find all information on settings and metadata. We put this in the attributes of the '.h5' file main group.
Finally in 'results' we place  all the data produced by the labelling or simulation. The first two sections
are the same in both the basic and the extended version. In the results part there will be the option to put
extra data.

## Results
The basic datasets in 'results' are: 
 - 'indices': Indices (row numbers) of the samples, in the order that they are labeled.
 - 'labels': Labels of the samples, in the same order as 'indices'.
 - 'predictor_model': Model that predicted that sample being labeled. This model is identified by a string
 of the form '{type}{training_set}'. Here 'type' is the model type, for example 'nb' or 'svm', and 
 'training_set' is an integer indicating the set on which the model was trained. If this is '0', the 
 model was trained on the prior knowledge, if it is 'k' then the model is trained on the prior knowledge 
 plus the first k samples. So for example 'nb15' or 'log2403'.
 - 'predictor_method': Prediction method of the predictor model, for example 'max' or 'random'.
 - 'time': The time at which the sample was labeled. 
 - 'models_being_trained': The model that were being trained right after the sample was labeled. In 
 simulation mode this is always the same model type with the training set equal to all labeled samples, 
 but in lab mode, multiple models might be trained at the same time. This will also be relevant when 
 multiple model types are used. The models are stored in a string, separated by a semicolon, e.g.
 'nb600;nb6001;lstm550'.
 
Note that 'indices' and 'labels' are also applicable for the prior knowledge. For 'time' and 
'models_being_trained' this is partly true. The time when the last prior was entered could be seen a sort
of start time, and the models that are being trained after the last prior would be relevant in the case of
multiple models. For now I've left the priors out of these datasets though.
 
Besides these datasets, there will be the option to store custom datasets, for example with all the sample
probabilities, or the model coefficients. This will be stored in a dynamic format: It will not be stored 
every time a sample is labeled, but only at certain intervals, or when a sample is labeled relevant. As
an example, if we set the interval to 5, and the sample 4, 7, 8 and 13 where relevant, then we would store
data after labeling 4, 5, 7, 8, 10, 13, 15, etc. We will save one 1-D dataset containing
these indices, and a 2-D dataset containing the actual data, for example the probabilities. 

## Test
Using a simulation run on the ACE dataset as an example, I made 3 prototypes. One in the basic version, one
with interval equal to 10, and one with interval equal to 1. This last case means that all probabilities
are stored, just like in the original. The original state file is around 104MB large. The 'basic', 
'interval=10' and 'interval=1' prototypes are respectively 4MB, 9MB and 54MB, so a serious reduction in size.
I guess this is mainly because data of one type is stored in one array, instead of having one array per 
labeled sample as in the original state file. 
