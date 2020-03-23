import React, {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  Typography,
} from '@material-ui/core'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({

}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const StartReview = (props) => {
  const classes = useStyles();

  const startTraining = () => {
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
    </Box>
  )
}

      // {activeStep === 5 && 
      //   <Grid
      //     container
      //     spacing={0}
      //     direction="column"
      //     alignItems="center"
      //     justify="center"
      //     className={classes.grid}
      //   >

      //     {/* transition to search tool - (Inclusions) */}
      //     <Grid item xs={12} sm={8}>
      //       <Fade
      //         in={activeStep === 5 && animated}
      //         timeout={transitionSpeed}
      //         mountOnEnter
      //         unmountOnExit
      //         onEnter={()=> {
      //           setTimeout(()=> {
      //             // console.log("exit")
      //             setAnimated(false);
      //           }, 4000)
      //         }}
      //         onExited={() => props.setAppState('review')}
      //       >
      //         <Box>
      //           <Typography variant="h5">
      //             Warming up the machines!
      //           </Typography>              
      //           <CircularProgress className={classes.loader}/>
      //         </Box>
      //       </Fade>
      //     </Grid>
      //   </Grid>
      // }

export default connect(mapStateToProps)(StartReview);