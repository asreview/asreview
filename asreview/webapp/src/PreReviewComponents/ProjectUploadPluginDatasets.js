import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import {
  Dataset,
} from '../PreReviewComponents';

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
      'error': false,
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
              'error': false,
            });
          })
          .catch((error) => {
            setState({
              'datasets': null,
              'loaded': true,
              'error': true,
            })
          });
      };

      if (!state.loaded && !state.error){
        fetchData();
      }

    }, [props.subset, state.loaded, state.error]);

    return (

      <Box className={classes.cards}>
        {state.loaded && !state.error &&
            <Box>
              {state.datasets.map(dataset => (
                <Dataset
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
          {state.loaded && state.error &&
            <Typography>Error loading datasets.</Typography>
          }
          {!state.loaded && !state.error &&
            <CircularProgress />
          }
        </Box>
      </Box>
    );
}

export default ProjectUploadPluginDatasets;

