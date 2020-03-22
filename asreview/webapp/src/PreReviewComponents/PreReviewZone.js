import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
  Button,
  Divider,
  Container,
  Typography,
  Fade,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@material-ui/core';
import {
  PriorInclusions,
  PriorExclusions,
  ProjectInit,
  ProjectUpload,
  StartReview,
} from '../PreReviewComponents'
// import ProjectUpload from './ProjectUpload.js' 

import '../PreReviewComponents/PreReviewZone.css'

// constants, settings and config
const transitionSpeed = 500;

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
  const [animated, setAnimated] = React.useState(false);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

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
              <StepLabel>Project info</StepLabel>
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
            <PriorInclusions
              handleNext={handleNext}
            />
          </Box>
        }

        {activeStep === 3 && 
            <PriorExclusions
              handleNext={handleNext}
            />
        }

      {activeStep === 4 &&
        <StartReview
          handleNext={handleNext}
        />
      }
      </Container>
    }

      {activeStep === 5 && 
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          className={classes.grid}
        >

          {/* transition to search tool - (Inclusions) */}
          <Grid item xs={12} sm={8}>
            <Fade
              in={activeStep === 5 && animated}
              timeout={transitionSpeed}
              mountOnEnter
              unmountOnExit
              onEnter={()=> {
                setTimeout(()=> {
                  // console.log("exit")
                  setAnimated(false);
                }, 4000)
              }}
              onExited={() => props.setAppState('review')}
            >
              <Box>
                <Typography variant="h5">
                  Warming up the machines!
                </Typography>              
                <CircularProgress className={classes.loader}/>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      }
    </Box>

  )
}

export default PreReviewZone;