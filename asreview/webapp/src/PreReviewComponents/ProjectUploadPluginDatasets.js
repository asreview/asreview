import React, {useState, useEffect} from 'react';
import {
  Box,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import {
  PluginDataset,
} from '../PreReviewComponents';

import ErrorHandler from '../ErrorHandler';

import { api_url } from '../globals.js';

import axios from 'axios';

const useStyles = makeStyles(theme => ({
  cards: {
    marginBottom: "20px",
    textAlign: "center",
    margin: 0,
  },
}));

const ProjectUploadPluginDatasets = (props) => {

    const classes = useStyles();

    const [state, setState] = useState({
      'datasets': null,
      'loaded': false,
    });

    const [error, setError] = useState({
      "message": null,
      "retry": false,
    });

    useEffect(() => {

      const fetchData = async () => {

        // contruct URL
        const url = api_url + "datasets";

        const params = {};

        // prepare properties and make subset
        params['subset'] = 'plugin'

        axios.get(
            url,
            {params: params}
          )
          .then((result) => {
            setState({
              'datasets': result.data['result'],
              'loaded': true,
            });
          })
          .catch((error) => {
            if (error.response) {
              setError({
                'message': error.response.data.message,
                'retry': true,
              });
              console.log(error.response);
            } else {
              setError(s => {return({
                ...s,
                'message': "Failed to connect to server. Please restart the software.",
              })});
            };
          });
      };

      if (!state.loaded && error.message === null){
        fetchData();
      }

    }, [props.subset, state.loaded, error.message]);

    return (

      <Box className={classes.cards}>
        {state.loaded && error.message === null &&
            <Box>
              {state.datasets.map(dataset => (
                <PluginDataset
                  key={dataset[dataset.length - 1].dataset_id}
                  dataset_id={dataset[dataset.length - 1].dataset_id}
                  title={dataset[dataset.length - 1].title}
                  description={dataset[dataset.length - 1].description}
                  img_url={dataset[dataset.length - 1].img_url}
                  onUploadHandler={props.onUploadHandler}
                />
              ))}
          </Box>
        }
        <Box>
          {!state.loaded && error.message === null &&
            <CircularProgress />
          }
          {error.message !== null &&
            <ErrorHandler
              error={error}
              setError={setError}
            />
          }
        </Box>
      </Box>
    );
}

export default ProjectUploadPluginDatasets;
