import React, {useEffect} from 'react'
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Radio,
  CardHeader,
  Avatar,
  Tooltip,
  IconButton,
} from '@material-ui/core'

import HelpIcon from '@material-ui/icons/Help';
import EditIcon from '@material-ui/icons/Edit';
import AssignmentIcon from '@material-ui/icons/Assignment';

import {
  Help,
  useHelp,
} from '../PreReviewComponents'

import axios from 'axios'

import { makeStyles } from '@material-ui/core/styles';

import './ReviewZone.css';

import { connect } from "react-redux";
import store from '../redux/store'

import { api_url, mapStateToProps } from '../globals.js';


const useStyles = makeStyles(theme => ({
  listTitle: {
    paddingLeft: "18px",
  },
}));

const StartReview = (props) => {
  const classes = useStyles();

  const [state, setState] = React.useState({
    "status": null,
    "message": null,
  });

  const [help, openHelp, closeHelp] = useHelp();


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

    if (state['status'] === null){
      setTimeout(startTraining, 3000);
    }

  }, []);

  console.log(state)

  return (
    <Box>

      { (state["status"] === null || state["status"] === "training") &&
        <Typography>Training model... (this can take some time)</Typography>
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
