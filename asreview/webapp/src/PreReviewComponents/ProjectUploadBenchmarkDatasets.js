import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import {
  BenchmarkDataset,
} from '../PreReviewComponents';

import ErrorHandler from '../ErrorHandler';

import { api_url } from '../globals.js';

import axios from 'axios';

const useStyles = makeStyles(theme => ({
  cards: {
    marginBottom: "20px",
    margin: 0,
  },
  title: {
    marginTop: "20px",
    marginLeft: "13px",
    marginBottom: "20px",
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
    });

    const [error, setError] = useState({
      "message": null,
      "retry": false,
    });

    const [expanded, setExpanded] = useState({
      'featured': false,
      'all': false,
    });

    const [uploading, setUploading] = useState(false);

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
            });
          })
          .catch((error) => {
            if (error.response) {
              setError({
                'message': error.response.data.message,
                'retry': true,
              });
              // setState({
              //   'datasets': null,
              //   'loaded': true,
              // });
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
          <Box className={classes.featured}>
            <Typography className={classes.title} variant="h6">Featured benchmark datasets</Typography>
            <Box>
              {state.datasets.filter(function(dataset) {
                  return dataset.featured;
                }).map((dataset, index, array) => (
                  <BenchmarkDataset
                    index={index}
                    expanded={expanded.featured}
                    setExpanded={setExpanded}
                    uploading={uploading}
                    setUploading={setUploading}
                    featured={dataset.featured}
                    key={array[array.length - 1 - index].dataset_id}
                    dataset_id={array[array.length - 1 - index].dataset_id}
                    authors={formatCitation(array[array.length - 1 - index].authors, array[array.length - 1 - index].year)}
                    description={array[array.length - 1 - index].topic}
                    doi={array[array.length - 1 - index].reference.replace(/^(https:\/\/doi\.org\/)/,"")}
                    title={array[array.length - 1 - index].title}
                    license={array[array.length - 1 - index].license}
                    link={array[array.length - 1 - index].link}
                    location={array[array.length - 1 - index].url}
                    onUploadHandler={props.onUploadHandler}
                  />
              ))}
            </Box>
          </Box>
        }
        {state.loaded && error.message === null &&
          <Box className={classes.all_datasets}>
            <Typography className={classes.title} variant="h6">All benchmark datasets</Typography>
            <Box>
              {state.datasets.map((dataset, index) => (
                <BenchmarkDataset
                  index={index}
                  expanded={expanded.all}
                  setExpanded={setExpanded}
                  uploading={uploading}
                  setUploading={setUploading}
                  key={dataset.dataset_id}
                  dataset_id={dataset.dataset_id}
                  authors={formatCitation(dataset.authors, dataset.year)}
                  description={dataset.topic}
                  doi={dataset.reference.replace(/^(https:\/\/doi\.org\/)/,"")}
                  title={dataset.title}
                  license={dataset.license}
                  link={dataset.link}
                  location={dataset.url}
                  onUploadHandler={props.onUploadHandler}
                />
              ))}
            </Box>
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

export default ProjectUploadBenchmarkDatasets;
