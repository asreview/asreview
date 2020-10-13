import React, {useEffect} from 'react'
import {
  Box,
  Typography,
} from '@material-ui/core'

import axios from 'axios'

import './ReviewZone.css';

import { connect } from "react-redux";

import { api_url, mapStateToProps } from '../globals.js';


const StartSimulation = ({project_id, onReady}) => {

  const [state, setState] = React.useState({
    "status": null,
    "message": null,
  });

  useEffect(() => {

    const checkSimulationIsDone = () => {

      const url = api_url + `project/${project_id}/simulation_ready`;

      return axios.get(url)
      .then((result) => {


        if (result.data["status"] === 1){
          // simulation ready
          onReady();
        } else {
          // simulation not ready yet
          setTimeout(checkSimulationIsDone, 2000);
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

        setState({
          "status": "error",
          "message": message,
        })
      });
    }

    const startSimulation = () => {

      // set the state to 'model simulating'
      setState({
        "status": "simulating",
        "message": null,
      })

      const url = api_url + `project/${project_id}/simulate`;

      return axios({
        method: 'post',
        url: url,
        data: {},
        headers: {'Content-Type': 'multipart/form-data' }
      })
      .then((result) => {
        checkSimulationIsDone();
      })
      .catch((error) => {
        console.log(error);
        setState({
          "status": "error",
          "message": error,
        })
      });
    }
    if (state.status === null){
      setTimeout(startSimulation, 3000);
    }

  }, [state.status, project_id, onReady]);

  return (
    <Box>

      { (state["status"] === null || state["status"] === "simulating") &&
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

export default connect(mapStateToProps)(StartSimulation);
