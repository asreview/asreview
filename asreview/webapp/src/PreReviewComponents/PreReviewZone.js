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
    project_id: props.project_id,
    step: 0,
    ready: false
  });

  const handleNext = (evt, project_id) => {

    handleStep(state.step + 1, project_id)

  };

  const isReady = () => {

    setState({
      project_id: state.project_id,
      step: state.step,
      ready: true,
    });
  }

  const handleStep = (index, project_id) => {

    let project_id_update = state.project_id

    if (project_id !== undefined){
      project_id_update = project_id
    }

    setState({
      project_id: project_id_update,
      step: index,
      ready: state.ready,
    });

  }

  const scrollToBottom = () => {
    EndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  console.log("PreReviewZone updates and project_id: " + props.project_id)
  console.log(state)
  console.log(store.getState()["project_id"])

  return (


    <Box className={classes.box}>
    {state.step !== 5 &&
      <Container maxWidth='md'>

        {(state.step >= 0 && state.step < 4) &&
          <Box>
            <ProjectInit
              project_id={state.project_id}
              handleStep={handleStep}
              isReady={isReady}
            />
          </Box>
        }
        {(state.step >= 1 && state.step < 4) &&
          <Box>
            <ProjectUpload
              project_id={state.project_id}
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
              project_id={state.project_id}
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
              project_id={state.project_id}
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
          onClick={handleNext}
          className={classes.nextButton}
        >
          Finish
        </Button>

      }
      </Container>
    }

    {state.step === 4 &&

      <StartReview
        project_id={state.project_id}
        handleAppState={props.handleAppState}
      />

    }


    </Box>

  )
}

export default connect(mapStateToProps)(PreReviewZone);
