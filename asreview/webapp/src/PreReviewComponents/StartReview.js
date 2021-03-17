import React, {useEffect} from 'react'
import {
  Box,
  Link,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { ProjectAPI } from '../api/index.js';

import './ReviewZone.css';

import { connect } from "react-redux";

import { mapStateToProps } from '../globals.js';


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

      return ProjectAPI.init_ready(project_id)
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

          if (error.response) {
            setState({
              "status": "error",
              "message": error.response.data.message,
            });
            console.log(error.response);
          } else if (error.request) {
            console.log(error.request);
          } else {
            setState({
              "status": "error",
              "message": "Failed to connect to server. Please restart the software.",
            });
          };

        });
    }

    const startTraining = () => {

      // set the state to 'model training'
      setState({
        "status": "training",
        "message": null,
      })

      return ProjectAPI.start(project_id)
        .then((result) => {
          checkModelIsFitted();
        })
        .catch((error) => {
          if (error.response) {
            setState({
              "status": "error",
              "message": error.response.data.message,
            });
            console.log(error.response);
          } else {
            setState({
              "status": "error",
              "message": "Failed to connect to server. Please restart the software.",
            });
          };
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
            If the issue remains after retrying, click
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
