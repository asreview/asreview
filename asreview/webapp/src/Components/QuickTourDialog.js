import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Dialog,
  MobileStepper,
  IconButton,
  Paper,
  Typography,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';

import Welcome from '../images/QuickTour/1_Welcome.svg';
import SetUp from '../images/QuickTour/2_SetUp.svg';
import Start from '../images/QuickTour/3_StartReviewing.svg';
import Benefit from '../images/QuickTour/4_BenefitFromAIAssisted.svg';
import DontStress from '../images/QuickTour/5_DontStress.svg';
import Done from '../images/QuickTour/6_DoneItsYourChoice.svg';
import Publish from '../images/QuickTour/7_PublishYourWork.svg';


const quickTourSteps = [
  { 
    imgPath: Welcome,
    textTitle: "Introducing\nAI-assisted reviewing",
    text: "Take a quick tour to\nlearn the basics!",
  },
  {
    imgPath: SetUp,
    textTitle: "Set up",
    text: "Create your project\nby supplying your\ndata set",
  },
  {
    imgPath: Start,
    textTitle: "Start reviewing",
    text: "Your decisions are used to\npresent the most relevant\npublications first",
  },
  {
    imgPath: Benefit,
    textTitle: "Benefit from AI-assisted\nreviewing",
    text: "After each decision the\npredicted ranking of publications is\nupdated. The ranking can be\naccessed at all times!",
  },
  {
    imgPath: DontStress,
    textTitle: "Don't stress",
    text: "Your projects are\nsaved (locally!)\nautomatically",
  },
  {
    imgPath: Done,
    textTitle: "Done? It's your choice!",
    text: "You decide when to\nfinish the reviewing\nprocess",
  },
  {
    imgPath: Publish,
    textTitle: "Publish your work",
    text: "To enhance transparency,\nshare the state-file which\ncontains all your decisions,\nas well as all the technical\ninformation",
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
  paper: {
    height: 440,
  },
  img: {
    height: 270,
    display: 'block',
    overflow: 'hidden',
    width: '100%',
  },
  textTitleWrap: {
    paddingBottom: 18,
  },
  text: {
    display: 'flex',
    textShadow: "0 0 0.5px",
    justifyContent: 'center',
    lineHeight: '18pt',
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
      
      <div className={classes.paper}>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={activeStep}
          onChangeIndex={handleStepChange}
          enableMouseEvents
        >
          {quickTourSteps.map((step, index) => (
            <div>
              {Math.abs(activeStep - index) <= 2 ? (
                <img className={classes.img} src={step.imgPath} alt={step.textTitle}/>
              ) : null}
              
              <div className={classes.textTitleWrap}>
                <Typography variant="h6">
                  {step.textTitle.split("\n").map((i, key) => {
                    return <div className={classes.text} key={key}>{i}</div>;
                  })}
                </Typography>
              </div>
              
              <div>
                <Typography variant="subtitle1">
                  {step.text.split("\n").map((i, key) => {
                    return <div className={classes.text} key={key}>{i}</div>;
                  })}
                </Typography>
              </div>              
            </div>
          ))}
        </SwipeableViews>
      </div>

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
