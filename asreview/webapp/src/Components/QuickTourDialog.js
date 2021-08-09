import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Dialog,
  MobileStepper,
  Button,
  IconButton,
  Paper,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import SwipeableViews from "react-swipeable-views";

import semverValid from "semver/functions/valid";
import semverCoerce from "semver/functions/coerce";
// import semverMajor from 'semver/functions/major';
// import semverMinor from 'semver/functions/minor';

import Welcome from "../images/QuickTour/1_Welcome.svg";
import SetUp from "../images/QuickTour/2_SetUp.svg";
import Start from "../images/QuickTour/3_StartReviewing.svg";
import Benefit from "../images/QuickTour/4_BenefitFromAIAssisted.svg";
import DontStress from "../images/QuickTour/5_DontStress.svg";
import Done from "../images/QuickTour/6_DoneItsYourChoice.svg";
import Publish from "../images/QuickTour/7_PublishYourWork.svg";

import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return {
    asreview_version: state.asreview_version,
  };
};

const quickTourSteps = [
  {
    imgPath: Welcome,
    textTitle: "Quick Tour",
    text: "Take a quick tour to learn the basics of systematic reviewing with ASReview!",
  },
  {
    imgPath: SetUp,
    textTitle: "Easy project setup",
    text: "Supply a clean dataset, select prior knowledge, and choose a machine learning model (optional).",
  },
  {
    imgPath: Start,
    textTitle: "Mark text as (ir)relevant",
    text: "Read the displayed text and decide whether it is relevant or not.",
  },
  {
    imgPath: Benefit,
    textTitle: "Benefit from AI-assisted reviewing",
    text: "After each decision, the predicted ranking of records is updated and you will see the most relevant record next (default).",
  },
  {
    imgPath: DontStress,
    textTitle: "Autosave",
    text: "Your screening decisions are automatically saved on your own device.",
  },
  {
    imgPath: Done,
    textTitle: "Done screening? It's your choice!",
    text: "You decide when to stop the reviewing process (but hopefully before you have reached the end of your dataset).",
  },
  {
    imgPath: Publish,
    textTitle: "Love Open Science",
    text: "Share the ASReview project file to enhance transparency and reproducibility.",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 350,
    flexGrow: 1,
  },
  header: {
    display: "flex",
    height: 45,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  paper: {
    height: 440,
  },
  img: {
    height: 270,
    display: "block",
    overflow: "hidden",
    width: "100%",
  },
  textTitle: {
    textAlign: "center",
    padding: "0px 18px",
  },
  textTitleWrap: {
    paddingBottom: 18,
  },
  text: {
    display: "flex",
    textShadow: "0 0 0.5px",
    justifyContent: "center",
    lineHeight: "18pt",
  },
  iconButtonBack: {
    width: "94px",
    textAlign: "left",
  },
  iconButtonNext: {
    width: "94px",
    textAlign: "right",
  },
}));

function QuickTourDialog(props) {
  const classes = useStyles();
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

  // get current version of asreview (pre-release excluded)
  const asreviewVersion = semverValid(semverCoerce(props.asreview_version));

  const closeQuickTour = (hard = false) => {
    // hard or soft close (permanent or not)
    if (hard) {
      // set current version of asreview to local storage
      window.localStorage.setItem("quickTourLatestVersion", asreviewVersion);
    }
    // close quick tour
    setQuickTour(false);
  };

  React.useEffect(() => {
    // get version stored in local storage
    const localVersion = semverValid(
      window.localStorage.getItem("quickTourLatestVersion")
    );

    if (asreviewVersion !== null && localVersion !== null) {
      // compare current version and version stored in local storage
      // see https://www.npmjs.com/package/semver#ranges
    } else if (localVersion === null) {
      // if no version stored in local storage, show quick tour
      setQuickTour(true);
    }
  }, [asreviewVersion]);

  return (
    <Dialog open={quickTour} onClose={closeQuickTour} scroll="body">
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
            axis={"x"}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
          >
            {quickTourSteps.map((step, index) => (
              <div key={step.textTitle} className={classes.textTitle}>
                {Math.abs(activeStep - index) <= 2 ? (
                  <img
                    className={classes.img}
                    src={step.imgPath}
                    alt={step.textTitle}
                  />
                ) : null}

                <div className={classes.textTitleWrap}>
                  <Typography variant="h6">
                    {step.textTitle.split("\n").map((i, key) => {
                      return (
                        <div className={classes.text} key={key}>
                          {i}
                        </div>
                      );
                    })}
                  </Typography>
                </div>

                <div>
                  <Typography variant="subtitle1">
                    {step.text.split("\n").map((i, key) => {
                      return (
                        <div className={classes.text} key={key}>
                          {i}
                        </div>
                      );
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
            <Box className={classes.iconButtonNext}>
              {activeStep === maxSteps - 1 && (
                <Button
                  size="small"
                  onClick={() => {
                    closeQuickTour(true);
                  }}
                  disabled={activeStep === 0}
                >
                  Let's start!
                </Button>
              )}
              {activeStep !== maxSteps - 1 && (
                <IconButton size="small" onClick={handleNext}>
                  <KeyboardArrowRight />
                </IconButton>
              )}
            </Box>
          }
          backButton={
            <Box className={classes.iconButtonBack}>
              {activeStep === 0 && (
                <Button size="small" onClick={closeQuickTour}>
                  Skip
                </Button>
              )}
              {activeStep !== 0 && (
                <IconButton
                  size="small"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  <KeyboardArrowLeft />
                </IconButton>
              )}
            </Box>
          }
        />
      </div>
    </Dialog>
  );
}

export default connect(mapStateToProps)(QuickTourDialog);
