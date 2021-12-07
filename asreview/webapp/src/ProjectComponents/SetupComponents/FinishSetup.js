import * as React from "react";
import ReactLoading from "react-loading";
import { useQueryClient } from "react-query";
import { connect } from "react-redux";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";

import { Box, Button, Fade, Slide, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";
import { mapStateToProps } from "../../globals.js";

import ElasBalloons from "../../images/ElasBalloons.png";
import Start from "../../images/QuickTour/3_StartReviewing.svg";
import Benefit from "../../images/QuickTour/4_BenefitFromAIAssisted.svg";
import DontStress from "../../images/QuickTour/5_DontStress.svg";
import Done from "../../images/QuickTour/6_DoneItsYourChoice.svg";
import Publish from "../../images/QuickTour/7_PublishYourWork.svg";

const images = [
  {
    imgPath: Start,
    textTitle: "Preparing your project",
    text: "Soon you can start reviewing the displayed text and decide whether it is relevant or not.",
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
    textTitle: "Done reviewing? It's your choice!",
    text: "You decide when to stop the reviewing process (but hopefully before you have reached the end of your dataset).",
  },
  {
    imgPath: Publish,
    textTitle: "Love Open Science",
    text: "Share the ASReview project file to enhance transparency and reproducibility.",
  },
];

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const PREFIX = "FinishSetup";

const classes = {
  root: `${PREFIX}-root`,
  swipeable: `${PREFIX}-swipeable`,
  img: `${PREFIX}-img`,
  swipeableContent: `${PREFIX}-swipeable-content`,
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [`& .${classes.root}`]: {
    alignItems: "center",
  },

  [`& .${classes.swipeable}`]: {
    width: "75%",
  },

  [`& .${classes.img}`]: {
    marginLeft: 48,
    width: 250,
    [theme.breakpoints.down("md")]: {
      width: 150,
    },
  },

  [`& .${classes.swipeableContent}`]: {
    textAlign: "center",
    padding: "0px 18px",
  },

  [`& .${classes.text}`]: {
    display: "flex",
    textShadow: "0 0 0.5px",
    justifyContent: "center",
    lineHeight: "18pt",
  },
}));

const FinishSetup = (props) => {
  const queryClient = useQueryClient();
  const theme = useTheme();

  const [activeStep, setActiveStep] = React.useState(0);
  const [buttonIn, setButtonIn] = React.useState(false);

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const refetchProjectReady = () => {
    queryClient.resetQueries("fetchProjectReady");
  };

  const onClickProjectReview = () => {
    console.log("Opening existing project " + props.project_id);
    props.handleAppState("project-page");
    props.handleNavState("review");
  };

  React.useEffect(() => {
    if (props.trainingFinished) {
      setTimeout(() => setButtonIn(true), 2000);
    }
  }, [props.trainingFinished]);

  return (
    <Root>
      {props.isStartTrainingError && (
        <InlineErrorHandler
          message={props.startTrainingError?.message}
          refetch={props.restartTraining}
          button={true}
        />
      )}
      {!props.isPreparingProject && props.isProjectReadyError && (
        <InlineErrorHandler
          message={props.projectReadyError?.message}
          refetch={refetchProjectReady}
          button={true}
        />
      )}
      {!props.isStartTrainingError &&
        !props.isProjectReadyError &&
        !props.trainingFinished && (
          <Fade
            in={
              !props.isStartTrainingError &&
              !props.isProjectReadyError &&
              !props.trainingFinished
            }
          >
            <Stack spacing={1} className={classes.root}>
              <AutoPlaySwipeableViews
                axis={"x"}
                index={activeStep}
                interval={5000}
                onChangeIndex={handleStepChange}
                enableMouseEvents
                className={classes.swipeable}
              >
                {images.map((step, index) => (
                  <Box key={index} className={classes.swipeableContent}>
                    {Math.abs(activeStep - index) <= 2 ? (
                      <Box
                        component="img"
                        sx={{
                          height: 255,
                          maxWidth: 400,
                          overflow: "hidden",
                          width: "100%",
                        }}
                        src={step.imgPath}
                        alt={step.textTitle}
                      />
                    ) : null}
                    <Stack spacing={2}>
                      {step.textTitle.split("\n").map((i, key) => {
                        return (
                          <Typography
                            variant="h6"
                            className={classes.text}
                            key={key}
                          >
                            {i}
                          </Typography>
                        );
                      })}
                      {step.text.split("\n").map((i, key) => {
                        return (
                          <Typography className={classes.text} key={key}>
                            {i}
                          </Typography>
                        );
                      })}
                    </Stack>
                  </Box>
                ))}
              </AutoPlaySwipeableViews>
              <ReactLoading
                type="bubbles"
                color={theme.palette.primary.main}
                height={100}
                width={100}
              />
            </Stack>
          </Fade>
        )}
      {props.trainingFinished && (
        <Stack spacing={3} className={classes.root} sx={{ overflow: "hidden" }}>
          <Slide direction="up" in={props.trainingFinished} timeout={2000}>
            <img
              src={ElasBalloons}
              alt="ElasBalloons"
              className={classes.img}
            />
          </Slide>
          <Fade in={buttonIn}>
            <Stack spacing={3} className={classes.root}>
              <Typography variant="h6">Your project is ready</Typography>
              <Button onClick={onClickProjectReview}>Start Reviewing</Button>
            </Stack>
          </Fade>
        </Stack>
      )}
    </Root>
  );
};

export default connect(mapStateToProps)(FinishSetup);
