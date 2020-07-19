import React, {useRef, useEffect}  from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Typography,
} from '@material-ui/core';
import {
  PriorKnowledge,
  ProjectInit,
  ProjectUpload,
  ProjectAlgorithms,
  StartReview,
  HelpDialog,
} from '../PreReviewComponents'
// import ProjectUpload from './ProjectUpload.js'

import { connect } from "react-redux";
import store from '../redux/store'

import axios from 'axios'

import { api_url, mapStateToProps } from '../globals.js';

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: "128px",
    paddingBottom: "84px",
    textAlign: "center",
  },
  title: {
    fontWeight: "300",
    letterSpacing: ".7rem",
  },
  continuButton: {
    marginTop: "24px",
  },

}));

const ProjectPage = (props) => {

  const classes = useStyles();

  const [state, setState] = React.useState({
    loading: true,
    data: null
  });

  useEffect(() => {

    const fetchProjectInfo = async () => {

      // contruct URL
      const url = api_url + "project/" + props.project_id + "/info";

      axios.get(url)
        .then((result) => {

          setState({
            loading: false,
            data: result.data,
          })

        })
        .catch((error) => {
          console.log(error);
        });
    };

    fetchProjectInfo();


  }, []);

  return (


    <Box className={classes.box}>

        <Container maxWidth='md'>
          {!state.loading &&
            <Box className={classes.header}>
              <Typography
                variant="h3"
                gutterBottom={true}
                color="primary"
                className={classes.title}
              >
                {state.data.name}
              </Typography>
              <Typography
                color="primary"
                variant="h5"
              >{state.data.description}</Typography>
              <Button
                className={classes.continuButton}
                variant={"outlined"}
                onClick={()=>props.handleAppState("review")}
              >Continue reviewing</Button>
            </Box>
          }

        </Container>

    </Box>

  )
}

export default ProjectPage;
