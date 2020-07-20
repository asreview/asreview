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
  box: {
    marginTop: 20,
    // marginBottom: 30,
    // height: 600,

  },
  grid: {
    minHeight: '100vh',
    padding: 6,

  },
  loader: {
    // display: 'flex',
    // '& > * + *': {
    //   marginLeft: theme.spacing(2),
    // },
    margin: '0 auto',
    display: 'block',
    marginTop: 12,
  },
  root: {
    // maxWidth: '1200px',
    margin: "24px 0px 24px 0px",
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  nextButton: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
}));

const PreReviewZone = (props) => {

  const classes = useStyles();

  const EndRef = useRef(null)

  const [state, setState] = React.useState({
    new: (props.project_id === null),
    step: (props.project_id === null) ? 0 : null,
    ready: false
  });

  const handleNext = (step_i=state.step) => {

    if (state.step <= step_i){
      handleStep(state.step + 1)
    }
  };

  const isReady = () => {

    setState({
      new: state.new,
      step: state.step,
      ready: true,
    });
  }

  const handleStep = (index) => {

    setState({
      new: state.new,
      step: index,
      ready: state.ready,
    });

  }

  const scrollToBottom = () => {
    EndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {

    const fetchProjectInfo = async () => {

      // contruct URL
      const url = api_url + "project/" + props.project_id + "/info";

      axios.get(url)
        .then((result) => {

          console.log(result.data);

          let set_step = 1;
          if (result.data["projectHasDataset"]){
            set_step = 2;
          }
          if (result.data["projectHasPriorKnowledge"]){
            set_step = 3;
          }

          console.log(set_step)

          // set the project step
          setState({
            new: state.new,
            step: set_step,
            ready: state.ready
          })

        })
        .catch((error) => {
          console.log(error);
        });
    };

    // run if the state is "lock"
    if (!state.new){
        fetchProjectInfo();
    }

  }, [state.new]);

  console.log(state)

  return (


    <Box className={classes.box}>


      {state.step !== 5 &&
        <Container maxWidth='md'>

          {(state.step >= 1 && state.step < 4) &&
            <Box>
              <ProjectUpload
                new={state.new}
                edit={state.step === 1}
                project_id={props.project_id}
                handleNext={handleNext}
                handleStep={handleStep}
                isReady={isReady}
                scrollToBottom={scrollToBottom}
              />
              <div ref={EndRef} />
            </Box>
          }
          {(state.step >= 2 && state.step < 4) &&
            <Box>
              <PriorKnowledge
                project_id={props.project_id}
                handleNext={handleNext}
                isReady={isReady}
                scrollToBottom={scrollToBottom}
              />
              <div ref={EndRef} />
            </Box>
          }

        {(state.step >= 3 && state.step < 4) &&
            <Box>
              <ProjectAlgorithms
                project_id={props.project_id}
                new={state.new}
                edit={state.step === 3}
                scrollToBottom={scrollToBottom}
                handleReviewDrawer={props.handleReviewDrawer}
              />
              <div ref={EndRef} />
            </Box>
        }

        {/* Go to the next step if upload was successfull */}
        {(state.step >= 1 && state.step <3) &&

          <Button
            variant="contained"
            color="primary"
            disabled={!state.ready}
            onClick={() => handleNext(state.step)}
            className={classes.nextButton}
          >
            Next
          </Button>
        }

        {state.step === 3 &&

          <Button
            variant="contained"
            color="primary"
            disabled={false}
            onClick={props.finishProjectSetup}
            className={classes.nextButton}
          >
            Finish
          </Button>
        }

        </Container>
      }

    </Box>

  )
}

export default connect(mapStateToProps)(PreReviewZone);
