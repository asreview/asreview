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
import { ProjectAPI } from '../api/index.js';


const useStyles = makeStyles(theme => ({
  accordion: {
    marginBottom: "20px",
    margin: 0,
  },
  title: {
    marginTop: "20px",
    marginLeft: "13px",
    marginBottom: "20px",
  },
  loading: {
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

        const params = {};

        // prepare properties and make subset
        params['subset'] = 'benchmark'

        ProjectAPI.datasets(params, setError)
          .then((result) => {
            setState({
              'datasets': result.data['result'],
              'loaded': true,
            });
          })
          .catch((error) => {
            // handled in api wrapper
          });
      };

      if (!state.loaded && error.message === null){
        fetchData();
      }

    }, [props.subset, state.loaded, error.message]);

    return (

      <Box className={classes.accordion}>
        {state.loaded && error.message === null &&
          <Box>
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
          <Box>
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
        <Box className={classes.loading}>
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
