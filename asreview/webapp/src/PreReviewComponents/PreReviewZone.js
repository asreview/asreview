import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
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
  StartReview,
} from '../PreReviewComponents'
// import ProjectUpload from './ProjectUpload.js'

import '../PreReviewComponents/PreReviewZone.css'

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

}));

const PreReviewZone = (props) => {
  const classes = useStyles();

  // const [activeStep, setActiveStep] = React.useState(
  //   {'step': 0, 'animation': true}
  // );

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleStep = (index) => {
    setActiveStep(index);
  }

  return (


    <Box className={classes.box}>
    {activeStep !== 5 &&
      <Container maxWidth='md'>
        <div className={classes.root}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            style={{ backgroundColor: "transparent" }}
          >
            <Step key="create-project">
            {(activeStep === 1) &&
              <StepButton onClick={() => {handleStep(0)}} key="create-project">
                <StepLabel>Project info</StepLabel>
              </StepButton>
            }
            {(activeStep !== 1) &&
              <StepLabel>Project info</StepLabel>
            }
            </Step>

            <Step key="select-dataset">
              <StepLabel>Select dataset</StepLabel>
            </Step>
            <Step key="select-inclusions">
              <StepLabel>Select inclusions</StepLabel>
            </Step>
            <Step key="label-random">
              <StepLabel>Label random</StepLabel>
            </Step>
            <Step key="start-review">
              <StepLabel>Start reviewing</StepLabel>
            </Step>
          </Stepper>
          </div>

        {activeStep === 0 &&
          <Box>
            <ProjectInit
              handleNext={handleNext}
            />
          </Box>
        }
        {activeStep === 1 &&
          <Box>
            <ProjectUpload
              handleNext={handleNext}
            />
          </Box>
        }
        {activeStep === 2 &&
          <Box>
            <PriorKnowledge
              handleNext={handleNext}
            />
          </Box>
        }

      {activeStep === 3 &&
        <StartReview
          handleAppState={props.handleAppState}
          handleReviewDrawer={props.handleReviewDrawer}
        />
      }
      </Container>
    }
    </Box>

  )
}

export default PreReviewZone;
