import React, {useEffect} from 'react'
import {
  Box,
  Link,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios'

import './ReviewZone.css';

import { connect } from "react-redux";

import { api_url, mapStateToProps } from '../globals.js';


const useStyles = makeStyles(theme => ({
  link: {
    paddingLeft: "3px",
  },
}));

const StartReview = ({project_id, onReady}) => {

  const classes = useStyles();

  const [state, setState] = React.useState({
    "status": null,
    "message": null,
  });

  useEffect(() => {

    const checkModelIsFitted = () => {

      const url = api_url + `project/${project_id}/model/init_ready`;

      return axios.get(url)
      .then((result) => {


        if (result.data["status"] === 1){
          // model ready
          onReady();
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

        setState({
          "status": "error",
          "message": message,
        })
      });
    }

    const startTraining = () => {

      // set the state to 'model training'
      setState({
        "status": "training",
        "message": null,
      })

      const url = api_url + `project/${project_id}/start`;

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
    if (state.status === null){
      setTimeout(startTraining, 3000);
    }

  }, [state.status, project_id, onReady]);

  return (
    <Box>

      { (state["status"] === null || state["status"] === "training") &&
        <Typography>(This can take some time)</Typography>
      }

      { state["status"] === "error" &&
        <Box>
          <Typography
            variant="h6"
            color="error"
          >
            {state["message"]}
          </Typography>
          <Typography
            color="error"
          >
            If the issue remains after refreshing, click
            <Link
              className={classes.link}
              href="https://github.com/asreview/asreview/issues/new/choose"
              target="_blank"
            >
              <strong>here</strong>
            </Link> to report.
          </Typography>
        </Box>
      }
    </Box>
  )
}

export default connect(mapStateToProps)(StartReview);
