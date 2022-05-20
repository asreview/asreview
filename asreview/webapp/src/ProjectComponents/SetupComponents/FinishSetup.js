import * as React from "react";
import ReactLoading from "react-loading";
import { useMutation, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";

import { Box, Button, Fade, Slide, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";
import { TypographyH5Medium } from "../../StyledComponents/StyledTypography";
import { ProjectAPI } from "../../api";
import {
  mapStateToProps,
  mapDispatchToProps,
  projectModes,
  projectStatuses,
} from "../../globals.js";

import ElasBalloons from "../../images/ElasBalloons.svg";
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
    text: "Your decisions are automatically saved on your own device.",
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
  display: "flex",
  [`& .${classes.root}`]: {
    alignItems: "center",
  },

  [`& .${classes.swipeable}`]: {
    width: "75%",
  },

  [`& .${classes.img}`]: {
    height: 255,
    maxWidth: 400,
  },

  [`& .${classes.swipeableContent}`]: {
    alignItems: "center",
    padding: "0px 18px",
    textAlign: "center",
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

  const { error, isError, mutate } = useMutation(
    ProjectAPI.mutateProjectStatus,
    {
      onSuccess: () => {
        props.handleBack();
        props.setTrainingStarted(false);
        queryClient.resetQueries("fetchProjectStatus");
      },
    }
  );

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const onClickProjectReview = async () => {
    props.toggleProjectSetup();
    console.log("Opening existing project " + props.project_id);
    await queryClient.prefetchQuery(
      ["fetchInfo", { project_id: props.project_id }],
      ProjectAPI.fetchInfo
    );
    navigate(`/projects/${props.project_id}/review`);
    props.setProjectId(null);
  };

  const onClickFinishSetupSimulation = () => {
    props.toggleProjectSetup();
    queryClient.invalidateQueries("fetchProjects");
  };

  const onClickClearError = () => {
    mutate({
      project_id: props.project_id,
      status: projectStatuses.SETUP,
    });
  };

  React.useEffect(() => {
    if (props.trainingFinished) {
      setTimeout(() => setButtonIn(true), transitionTimeout);
    }
  }, [props.trainingFinished]);

  return (
    <Root>
      <Stack spacing={3}>
        {props.isStartTrainingError && (
          <InlineErrorHandler
            message={props.startTrainingError?.message}
            refetch={props.restartTraining}
            button={true}
          />
        )}
        {!props.isPreparingProject && props.isProjectReadyError && (
          <Stack className={classes.root} spacing={3}>
            <InlineErrorHandler message={props.projectReadyError?.message} />
            <Button onClick={onClickClearError}>Return to previous step</Button>
          </Stack>
        )}
        {isError && (
          <InlineErrorHandler
            message={error?.message}
            refetch={onClickClearError}
            button={true}
          />
        )}
      </Stack>
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
                  <Stack key={index} className={classes.swipeableContent}>
                    {Math.abs(activeStep - index) <= 2 ? (
                      <Box
                        className={classes.img}
                        component="img"
                        sx={{
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
                  </Stack>
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
        <Stack spacing={3} className={classes.root}>
          <Slide
            direction="up"
            in={props.trainingFinished}
            timeout={transitionTimeout}
          >
            <Box
              className={classes.img}
              component="img"
              src={ElasBalloons}
              alt="ElasBalloons"
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
