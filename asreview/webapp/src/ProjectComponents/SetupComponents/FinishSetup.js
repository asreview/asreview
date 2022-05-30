import * as React from "react";
import ReactLoading from "react-loading";
import { useMutation, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import YouTube from "react-youtube";

import { Button, Fade, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";
import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography";
import { ProjectAPI } from "../../api";
import {
  mapStateToProps,
  mapDispatchToProps,
  projectModes,
  projectStatuses,
} from "../../globals.js";

const YouTubeVideoID = "gBmDJ1pdPR0";

const PREFIX = "FinishSetup";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  [`& .${classes.root}`]: {
    alignItems: "center",
  },
}));

const FinishSetup = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const { error, isError, mutate } = useMutation(
    ProjectAPI.mutateProjectStatus,
    {
      onSuccess: () => {
        props.handleBack();
        queryClient.resetQueries("fetchProjectStatus");
      },
    }
  );

  const onClickCloseSetup = async () => {
    props.toggleProjectSetup();
    console.log("Opening existing project " + props.project_id);
    await queryClient.prefetchQuery(
      ["fetchInfo", { project_id: props.project_id }],
      ProjectAPI.fetchInfo
    );
    if (props.mode !== projectModes.SIMULATION) {
      navigate(`/projects/${props.project_id}/review`);
    } else {
      navigate(`/projects/${props.project_id}`);
    }
    props.setProjectId(null);
  };

  const onClickClearError = () => {
    mutate({
      project_id: props.project_id,
      status: projectStatuses.SETUP,
    });
  };

  const videoOnReady = (event) => {
    event.target.pauseVideo();
  };

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
      <Stack spacing={3} className={classes.root}>
        {!props.isStartTrainingError && !props.isProjectReadyError && (
          <YouTube
            videoId={YouTubeVideoID}
            opts={{
              height: "315",
              width: "560",
              playerVars: {
                autoplay: 1,
              },
            }}
            onReady={videoOnReady}
          />
        )}
        {!props.isStartTrainingError &&
          !props.isProjectReadyError &&
          !props.trainingFinished && (
            <Stack className={classes.root} spacing={1}>
              <TypographySubtitle1Medium>
                Preparing your project
              </TypographySubtitle1Medium>
              <ReactLoading
                type="bubbles"
                color={theme.palette.primary.main}
                height={60}
                width={60}
              />
            </Stack>
          )}
        {props.trainingFinished && (
          <Stack spacing={3} className={classes.root}>
            {props.mode !== projectModes.SIMULATION && (
              <Fade in>
                <Stack spacing={3} className={classes.root}>
                  <TypographySubtitle1Medium>
                    Your project is ready
                  </TypographySubtitle1Medium>
                  <Button onClick={onClickCloseSetup}>Start Reviewing</Button>
                </Stack>
              </Fade>
            )}
            {props.mode === projectModes.SIMULATION && (
              <Fade in>
                <Stack spacing={3} className={classes.root}>
                  <Stack className={classes.root}>
                    <TypographySubtitle1Medium>
                      Your simulation project has been initiated
                    </TypographySubtitle1Medium>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      It will take some time to complete the simulation
                    </Typography>
                  </Stack>
                  <Button onClick={onClickCloseSetup}>Got it</Button>
                </Stack>
              </Fade>
            )}
          </Stack>
        )}
      </Stack>
    </Root>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FinishSetup);
