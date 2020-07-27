import React, {useEffect} from 'react'
import {
  Box,
  Typography,
} from '@material-ui/core'

import axios from 'axios'

import './ReviewZone.css';

import { connect } from "react-redux";

import { api_url, mapStateToProps } from '../globals.js';


const StartReview = (props) => {

  const [state, setState] = React.useState({
    "status": null,
    "message": null,
  });


  const checkModelIsFitted = () => {

    const url = api_url + `project/${props.project_id}/model/init_ready`;

    return axios.get(url)
    .then((result) => {


      if (result.data["status"] === 1){
        // model ready
        //props.handleAppState('review');
        props.onReady();
      } else {
        // not ready yet
        setTimeout(checkModelIsFitted, 2000);
      }
    })
    .catch((error) => {

      let message = "Unknown error.";

      if (error.response) {
          if ('message' in error.response.data){
              message = error.response.data["message"]
          }
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
      } else if (error.request) {
          console.log(error.request);
      } else {
          console.log('Error', error.message);
      }
      console.log(error.config);

      console.log(message)
      setState({
        "status": "error",
        "message": message,
      })
    });
  }


  useEffect(() => {

    const startTraining = () => {

      // set the state to 'model training'
      setState({
        "status": "training",
        "message": null,
      })

      const url = api_url + `project/${props.project_id}/start`;

      return axios({
        method: 'post',
        url: url,
        data: {},
        headers: {'Content-Type': 'multipart/form-data' }
      })
      .then((result) => {
        checkModelIsFitted();
      })
      .catch((error) => {
        console.log(error);
        setState({
          "status": "error",
          "message": error,
        })
      });
    }
    if (state['status'] === null){
      setTimeout(startTraining, 3000);
    }

  }, [state.status, props.project_id]);

  console.log(state)

  return (
    <Box>

      { (state["status"] === null || state["status"] === "training") &&
        <Typography>(This can take some time)</Typography>
      }

      { state["status"] === "error" &&
        <Box>
          <Typography
            color="error"
          >
            An error occured. Please send an email to asreview@uu.nl or file an issue on GitHub.
          </Typography>
          <Typography
            variant="h4"
            color="error"
          >
            Error message
          </Typography>
          <Typography
            color="error"
          >
            {state["message"]}
          </Typography>
        </Box>
      }
    </Box>
  )
}

export default connect(mapStateToProps)(StartReview);
