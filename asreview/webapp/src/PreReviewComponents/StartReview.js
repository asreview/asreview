import React, {} from 'react'
import {
  Box,
  Button,
  Typography,
} from '@material-ui/core'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

// const useStyles = makeStyles(theme => ({

// }));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const StartReview = (props) => {
  // const classes = useStyles();

  const [state, setState] = React.useState({
    "modelIsTraining": false
  });


  const startTraining = () => {

    // set the state to 'model training'
    setState({
      "modelIsTraining": true
    })

    const url = api_url + `project/${props.project_id}/start`;

    return axios.post(url)
    .then((result) => {
      checkModelIsFitted();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const checkModelIsFitted = () => {

    const url = api_url + `project/${props.project_id}/model/init_ready`;

    return axios.get(url)
    .then((result) => {


      if (result.data["status"] === 1){
        // model ready
        props.setAppState('review');
      } else {
        // not ready yet
        setTimeout(checkModelIsFitted, 2000);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }

  return (
    <Box>
      { !state["modelIsTraining"] ?
        <Box> 
          <Typography variant="h5">
            Start your systematic review
          </Typography>              

          <Button
            variant="contained"
            color="primary"
            onClick={startTraining}
          >
            Start
          </Button>
        </Box> :
        <Typography>Training model... (this can take some time)</Typography> 
      }
    </Box>
  )
}

export default connect(mapStateToProps)(StartReview);