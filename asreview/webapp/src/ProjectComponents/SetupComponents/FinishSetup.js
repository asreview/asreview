import * as React from "react";
import ReactLoading from "react-loading";
import { useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";

import { Box, Button, Fade, Slide, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography";
import {
  mapStateToProps,
  mapDispatchToProps,
  projectModes,
} from "../../globals.js";

import ElasBalloons from "../../images/ElasBalloons.png";
import PreparingProject from "../../images/FinishSetup_1_PreparingProject.svg";
import BenefitFromAI from "../../images/FinishSetup_2_BenefitFromAI.svg";
import Autosave from "../../images/FinishSetup_3_Autosave.svg";
import FinishReview from "../../images/FinishSetup_4_FinishReview.svg";
import OpenScience from "../../images/FinishSetup_5_OpenScience.svg";

const images = [
  {
    imgPath: PreparingProject,
    textTitle: "Preparing your project",
    text: "Soon you can start reviewing the displayed text and decide whether it is relevant or not.",
  },
  {
    imgPath: BenefitFromAI,
    textTitle: "Benefit from AI-assisted reviewing",
    text: "After each decision, the predicted ranking of records is updated and you will see the most relevant record next (default).",
  },
  {
    imgPath: Autosave,
    textTitle: "Autosave",
    text: "Your screening decisions are automatically saved on your own device.",
  },
  {
    imgPath: FinishReview,
    textTitle: "Done reviewing? It's your choice!",
    text: "You decide when to stop the reviewing process (but hopefully before you have reached the end of your dataset).",
  },
  {
    imgPath: OpenScience,
    textTitle: "Love Open Science",
    text: "Share the ASReview project file to enhance transparency and reproducibility.",
  },
];

const transitionTimeout = 1500;

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
  const navigate = useNavigate();
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
    props.setProjectId(null);
    props.toggleProjectSetup();
    console.log("Opening existing project " + props.project_id);
    navigate(`/projects/${props.project_id}/review`);
  };

  const onClickFinishSetupSimulation = () => {
    props.toggleProjectSetup();
    queryClient.invalidateQueries("fetchProjects");
  };

  React.useEffect(() => {
    if (props.trainingFinished) {
      setTimeout(() => setButtonIn(true), transitionTimeout);
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
          <Slide
            direction="up"
            in={props.trainingFinished}
            timeout={transitionTimeout}
          >
            <img
              src={ElasBalloons}
              alt="ElasBalloons"
              className={classes.img}
            />
          </Slide>
          {props.mode !== projectModes.SIMULATION && (
            <Fade in={buttonIn}>
              <Stack spacing={3} className={classes.root}>
                <TypographyH5Medium>Your project is ready</TypographyH5Medium>
                <Button onClick={onClickProjectReview}>Start Reviewing</Button>
              </Stack>
            </Fade>
          )}
          {props.mode === projectModes.SIMULATION && (
            <Fade in={buttonIn}>
              <Stack spacing={3} className={classes.root}>
                <TypographyH5Medium>
                  Your simulation project has been initiated
                </TypographyH5Medium>
                <Typography>
                  It will take some time to complete the simulation
                </Typography>
                <Button onClick={onClickFinishSetupSimulation}>Got it</Button>
              </Stack>
            </Fade>
          )}
        </Stack>
      )}
    </Root>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FinishSetup);
