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
    step: 0,
    ready: false
  });

  const handleNext = () => {

    setState({
      step: state.step + 1,
      ready: false,
    });

    // scrollToBottom();
  };

  const isReady = () => {

    setState({
      step: state.step,
      ready: true,
    });
  }

  const handleStep = (index) => {
    setState({
      step: index,
      ready: state.ready,
    });

    // scrollToBottom();
  }

  const scrollToBottom = () => {
    EndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  console.log(state)

  return (


    <Box className={classes.box}>
    {state.step !== 5 &&
      <Container maxWidth='md'>
        <div className={classes.root}>
          <Stepper
            step={state.step}
            alternativeLabel
            style={{ backgroundColor: "transparent" }}
          >
            <Step key="create-project">
            {(state.step === 1) &&
              <StepButton onClick={() => {handleStep(0)}} key="create-project">
                <StepLabel>Project info</StepLabel>
              </StepButton>
            }
            {(state.step !== 1) &&
              <StepLabel>Project info</StepLabel>
            }
            </Step>

            <Step key="select-dataset">
              <StepLabel>Select dataset</StepLabel>
            </Step>
            <Step key="select-prior-knowledge">
              <StepLabel>Prior Knowledge</StepLabel>
            </Step>
            <Step key="start-review">
              <StepLabel>Select algorithms</StepLabel>
            </Step>
          </Stepper>
          </div>

        {(state.step >= 0 && state.step < 4) &&
          <Box>
            <ProjectInit
              handleNext={handleNext}
              isReady={isReady}
            />
          </Box>
        }
        {(state.step >= 1 && state.step < 4) &&
          <Box>
            <ProjectUpload
              handleNext={handleNext}
              isReady={isReady}
              scrollToBottom={scrollToBottom}
            />
            <div ref={EndRef} />
          </Box>
        }
        {(state.step >= 2 && state.step < 4) &&
          <Box>
            <PriorKnowledge
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
              scrollToBottom={scrollToBottom}
              handleAppState={props.handleAppState}
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

      <StartReview/>

    }


    </Box>

  )
}

export default PreReviewZone;
