import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  // Button,
  Dialog,
  MobileStepper,
  IconButton,
  Paper,
} from '@material-ui/core'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';

import Welcome from '../images/ElasWelcome.svg';

import CloseIcon from '@material-ui/icons/Close';

const quickTourSteps = [
  {
    label: "Welcome",
    imgPath: "../images/ElasWelcome.svg",
  },
  {
    label: "SetUp",
    imgPath: "../images/ElasWelcome.svg",
  },
  {
    label: "Review",
    imgPath: "../images/ElasWelcome.svg",
  },
  {
    label: "Stop",
    imgPath: "../images/ElasWelcome.svg",
  },
  {
    label: "Publish",
    imgPath: "../images/ElasWelcome.svg",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 350,
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    height: 45,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  img: {
    height: 400,
    display: 'block',
    // maxWidth: 400,
    overflow: 'hidden',
    width: '100%',
  },
}));


function QuickTourDialog(props) {

  const classes = useStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [quickTour, setQuickTour] = React.useState(false);
  const maxSteps = quickTourSteps.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const closeQuickTour = () => {
    window.localStorage.setItem("quickTour", false);
    setQuickTour(false);
  };

  React.useEffect(() => {
    const localQuickTour = window.localStorage.getItem("quickTour");
    const localQuickTourIsNull = localQuickTour === null;
    if (quickTour !== localQuickTourIsNull) {
      setQuickTour(true)
    };
  }, [quickTour]);


  return (
    <Dialog
      open={quickTour}
      onClose={closeQuickTour}
      scroll="body"
    >

    <div className={classes.root}>
      <Paper square elevation={0} className={classes.header}>
        <IconButton
          size="small"
          className={classes.closeButton}
          onClick={closeQuickTour}
        >
          <CloseIcon />
        </IconButton>
      </Paper>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        {quickTourSteps.map((step, index) => (
          <div key={step.label}>
            {Math.abs(activeStep - index) <= 2 ? (
              <img className={classes.img} src={Welcome} alt={step.label} />
            ) : null}
          </div>
        ))}
      </SwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position="static"
        variant="dots"
        activeStep={activeStep}
        nextButton={
          <IconButton size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
            
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </IconButton>
        }
        backButton={
          <IconButton size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            
          </IconButton>
        }
      />
    </div>
    </Dialog>
  );
}

export default QuickTourDialog;
