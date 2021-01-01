import React, {useState, useEffect} from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { api_url } from '../globals.js';

import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: '24px',
  },
  absolute: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },
  cardRoot: {
    width: 360,
    height: 250,
    display: "inline-block",
    margin: theme.spacing(2),
    // align: "center",
  },
  cards: {
    marginBottom: "20px",
    textAlign: "center",
    margin: 0,
  },
  media: {
    height: 140,
    backgroundColor: "#A3A3A3",
  },
}));


const Dataset = (props) => {

  const classes = useStyles();

  const [state, setState] = useState(false)

  const uploadDataset = () => {

    // upload state
    setState(true);

    // send upload request to server
    props.onUploadHandler(props.dataset.dataset_id, resetState);

  }

  const resetState = () => {
    // setState(false);
  }

  return (
    <Card
      className={classes.cardRoot}
      key={props.dataset.dataset_id}
      onClick={!state ? uploadDataset : undefined}
    >
      {!state ? <CardActionArea>
        <CardMedia
          className={classes.media}
          image={props.dataset.img_url}
          title={props.dataset.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {props.dataset.title}
          </Typography>
          <Typography noWrap variant="body2" color="textSecondary" component="p">
            {props.dataset.description}
          </Typography>
        </CardContent>
      </CardActionArea>:
      <div>
        <CardMedia
            className={classes.media}
            image={props.dataset.img_url}
            title={props.dataset.title}
          />
          <CardContent>
            <CircularProgress />
          </CardContent>
      </div>
    }
    </Card>
  )
}


const ProjectUploadDatasets = (props) => {

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
        if ((props.subset === 'plugin') | (props.subset === 'benchmark')){
          params['subset'] = props.subset
        }

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
                }).map(dataset => (
                  <Dataset
                    key={dataset.dataset_id}
                    dataset={dataset}
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
                    dataset={dataset}
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

export default ProjectUploadDatasets;

