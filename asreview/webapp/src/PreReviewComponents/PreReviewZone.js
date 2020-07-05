import React, {useRef}  from 'react'
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
    step: (props.project_id === null) ? 0 : 3,
    ready: false
  });

  const handleNext = (evt) => {

    handleStep(state.step + 1)

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

  console.log(state)

  return (


    <Box className={classes.box}>
    {state.step !== 5 &&
      <Container maxWidth='md'>

        {(state.step >= 0 && state.step < 4) &&
          <Box>
            <ProjectInit
              project_id={props.project_id}
              handleStep={handleStep}
              isReady={isReady}
            />
          </Box>
        }
        {(state.step >= 1 && state.step < 4) &&
          <Box>
            <ProjectUpload
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
              edit={state.new}
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
          onClick={handleNext}
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
          onClick={() => props.handleAppState("train-first-model")}
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
