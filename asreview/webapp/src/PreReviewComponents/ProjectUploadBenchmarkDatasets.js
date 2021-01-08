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

const formatCitation = (authors, year) => {

  if (Array.isArray(authors)){
      var first_author = authors[0].split(",")[0];
      return first_author + " et al. ("  + year + ")"
  } else {
    return authors
  }
}

const ProjectUploadBenchmarkDatasets = (props) => {

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
        params['subset'] = 'benchmark'

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
          <Box className={classes.featured}>
            <Typography variant="h5">Featured benchmark datasets</Typography>
            <Box>
              {state.datasets.filter(function(dataset) {
                  return dataset.featured;
                }).map((dataset, index, array) => (
                  <Dataset
                    key={array[array.length - 1 - index].dataset_id}
                    dataset_id={array[array.length - 1 - index].dataset_id}
                    title={formatCitation(array[array.length - 1 - index].authors, array[array.length - 1 - index].year)}
                    description={array[array.length - 1 - index].topic}
                    img_url={array[array.length - 1 - index].img_url}
                    onUploadHandler={props.onUploadHandler}
                  />
              ))}
            </Box>
          </Box>
        }
        {state.loaded && !state.error &&
          <Box className={classes.all_datasets}>
            <Typography variant="h5">All benchmark datasets</Typography>
            <Box>
              {state.datasets.map(dataset => (
                <Dataset
                  key={dataset.dataset_id}
                  dataset_id={dataset.dataset_id}
                  title={formatCitation(dataset.authors, dataset.year)}
                  description={dataset.topic}
                  img_url={dataset.img_url}
                  onUploadHandler={props.onUploadHandler}
                />
              ))}
            </Box>
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

export default ProjectUploadBenchmarkDatasets;

