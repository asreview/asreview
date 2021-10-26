import React, { useState, useRef, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import GetAppIcon from "@mui/icons-material/GetApp";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import {
  StartReview,
  PreReviewZone,
  ProjectInfo,
} from "../PreReviewComponents";

import ErrorHandler from "../ErrorHandler";
import DangerZone from "../DangerZone.js";
import PublicationZone from "../PublicationZone.js";

import Finished from "../images/ElasHoldingSIGNS_Finished.svg";
import InReview from "../images/ElasHoldingSIGNS_InReview.svg";
import SetUp from "../images/ElasHoldingSIGNS_SetUp.svg";

import { ProjectAPI } from "../api/index.js";
import { mapStateToProps, projectModes } from "../globals.js";

const PREFIX = "ProjectPageOLD";

const classes = {
  header: `${PREFIX}-header`,
  title: `${PREFIX}-title`,
  continuButton: `${PREFIX}-continuButton`,
  quickStartButtons: `${PREFIX}-quickStartButtons`,
  wrapper: `${PREFIX}-wrapper`,
  buttonProgress: `${PREFIX}-buttonProgress`,
  dangerZone: `${PREFIX}-dangerZone`,
  cardBox: `${PREFIX}-cardBox`,
  stateElas: `${PREFIX}-stateElas`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.header}`]: {
    paddingTop: "128px",
    paddingBottom: "48px",
    textAlign: "center",
  },

  [`& .${classes.title}`]: {
    fontWeight: "300",
    letterSpacing: ".7rem",
  },

  [`& .${classes.continuButton}`]: {},

  [`& .${classes.quickStartButtons}`]: {
    marginTop: "24px",
  },

  [`& .${classes.wrapper}`]: {
    margin: theme.spacing(1),
    position: "relative",
  },

  [`& .${classes.buttonProgress}`]: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  [`& .${classes.dangerZone}`]: {
    borderColor: "red",
    borderWidth: "2px",
    borderStyle: "solid",
    boxShadow: "none",
  },

  [`& .${classes.cardBox}`]: {
    paddingBottom: "24px",
  },

  [`& .${classes.stateElas}`]: {
    width: "100%",
    maxWidth: "200px",
    display: "block",
    margin: "auto",
  },
}));

const ProjectPageOLD = (props) => {
  const EndRef = useRef(null);

  const [state, setState] = useState({
    // info-header
    infoLoading: true,
    infoEditing: false,
    info: null,

    // stage
    setupFirstTime: props.setupFirstTime ? props.setupFirstTime : false,
    setup: false,
    training: false,
    trainingError: false,
    finished: null,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const editProjectInfo = () => {
    setState({
      ...state,
      infoEditing: true,
    });
  };

  const finishEditProjectInfo = () => {
    setState({
      ...state,
      infoEditing: false,
    });
  };

  const reloadProjectInfo = () => {
    setState((s) => {
      return {
        ...s,
        infoLoading: true,
      };
    });
  };

  const finishProjectSetup = () => {
    setState({
      ...state,
      setup: false,
      training: true,
    });
  };

  const finishProjectFirstTraining = () => {
    setState({
      ...state,
      training: false,
      info: { ...state.info, projectInitReady: true },
    });
    props.handleAppState("project-page");
  };

  const failedProjectFirstTraining = () => {
    setState({
      ...state,
      training: false,
      trainingError: true,
    });
  };

  const continueProjectSetup = () => {
    setState({
      ...state,
      setup: true,
    });
  };

  const retryProjectSetup = () => {
    ProjectAPI.clear_error(props.project_id)
      .then((result) => {
        setState((s) => {
          return {
            ...s,
            setup: true,
            trainingError: false,
          };
        });
      })
      .catch((error) => {
        setError({
          code: error.code,
          message: error.message,
        });
      });
  };

  const startReviewing = () => {
    props.handleAppState("review");
    props.toggleReview();
  };

  const finishProject = () => {
    ProjectAPI.finish(props.project_id)
      .then((result) => {
        setState((s) => {
          return {
            ...s,
            finished: !s.finished,
          };
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const returnElasState = () => {
    // setup
    if (!state.info.projectInitReady || state.setup) {
      return SetUp;
    }

    // review
    if (!state.finished) {
      return InReview;
    }

    // finished
    if (state.finished) {
      return Finished;
    }
  };

  const fetchProjectInfo = useCallback(async () => {
    ProjectAPI.info(props.project_id)
      .then((result) => {
        // update the state with the fetched data
        setState((s) => {
          return {
            ...s,
            infoLoading: false,
            info: result.data,
            finished: result.data.reviewFinished,
          };
        });
      })
      .catch((error) => {
        setError({
          code: error.code,
          message: error.message,
        });
      });
  }, [props.project_id]);

  const scrollToTop = () => {
    EndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!state.infoLoading && EndRef.current !== undefined) {
      scrollToTop();
    }
  }, [state.setup, state.finished, state.infoLoading]);

  useEffect(() => {
    if (state.infoLoading) {
      fetchProjectInfo();
    }
  }, [fetchProjectInfo, state.infoLoading, error.message]);

  return (
    <StyledBox>
      {error.message !== null && (
        <ErrorHandler error={error} setError={setError} />
      )}

      {error.message === null && !state.infoLoading && (
        <Box className={classes.box}>
          <div ref={EndRef} />
          <Container maxWidth="md">
            <Grid container spacing={3} className={classes.header}>
              <Grid item xs={12} sm={3}>
                <img
                  src={returnElasState()}
                  alt="ElasState"
                  className={classes.stateElas}
                />
              </Grid>
              <Grid item xs={12} sm={9}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  color="primary"
                  className={classes.title}
                >
                  {state.info.name}
                  <Tooltip title="Edit info">
                    <IconButton size="small" onClick={editProjectInfo}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Typography color="primary" variant="h5">
                  {state.info.description}
                </Typography>
                {/*
              </Grid>
              <Grid item xs={12}>
              */}
                <Box className={classes.quickStartButtons}>
                  {/* Project is not ready, continue setup */}
                  {!state.info.projectInitReady &&
                    !state.setup &&
                    !state.training &&
                    !state.trainingError && (
                      <Button
                        className={classes.continuButton}
                        variant={"outlined"}
                        onClick={continueProjectSetup}
                      >
                        {state.info.projectHasDataset ? "Finish" : "Start"}{" "}
                        setup
                      </Button>
                    )}

                  {state.info.projectInitReady &&
                    !state.setup &&
                    !state.training && (
                      <Tooltip title="Download results">
                        <IconButton
                          aria-label="Export"
                          onClick={props.toggleExportResult}
                          color="inherit"
                          size="large"
                        >
                          <GetAppIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                  {/* Project is ready, show button */}
                  {state.info.projectInitReady &&
                    !state.setup &&
                    !state.training &&
                    state.info["mode"] !== projectModes.SIMULATION && (
                      <Button
                        className={classes.continuButton}
                        variant={"outlined"}
                        onClick={startReviewing}
                        disabled={state.finished}
                      >
                        Open review screen
                      </Button>
                    )}

                  {!state.info.projectInitReady &&
                    !state.setup &&
                    state.training &&
                    !state.trainingError && (
                      <div className={classes.wrapper}>
                        <Button
                          variant={"outlined"}
                          disabled
                          className={classes.continuButton}
                          startIcon={<KeyboardVoiceIcon />}
                        >
                          Training model
                        </Button>
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      </div>
                    )}
                  {!state.info.projectInitReady &&
                    !state.setup &&
                    !state.training &&
                    state.trainingError && (
                      <div className={classes.wrapper}>
                        <Button
                          variant={"outlined"}
                          className={classes.continuButton}
                          onClick={retryProjectSetup}
                        >
                          Retry setup
                        </Button>
                      </div>
                    )}
                </Box>

                {/* Project is not ready, continue setup */}
                {(state.training || state.trainingError) && (
                  <StartReview
                    onReady={finishProjectFirstTraining}
                    notReady={failedProjectFirstTraining}
                    trainingError={state.trainingError}
                  />
                )}
              </Grid>
            </Grid>

            {/* Cards on the project board */}
            {!state.setup && (
              <Box className={classes.cardBox}>
                <PublicationZone
                  project_id={props.project_id}
                  showExportResult={
                    state.info.projectInitReady &&
                    !state.setup &&
                    !state.training
                  }
                  toggleExportResult={props.toggleExportResult}
                  reviewFinished={state.finished}
                  finishProject={finishProject}
                />
                <DangerZone
                  project_id={props.project_id}
                  handleAppState={props.handleAppState}
                />
              </Box>
            )}

            {/* Pre Review settings */}
            {!state.infoLoading && state.setup && (
              <PreReviewZone
                mode={state.info.mode}
                finishProjectSetup={finishProjectSetup}
                scrollToTop={scrollToTop}
                setError={setError}
              />
            )}
          </Container>
        </Box>
      )}
      {/* Edit project info*/}
      {error.message === null && !state.infoLoading && (
        <ProjectInfo
          edit={state.infoEditing}
          open={state.infoEditing}
          onClose={finishEditProjectInfo}
          reloadProjectInfo={reloadProjectInfo}
          info={state.info}
        />
      )}
    </StyledBox>
  );
};

export default connect(mapStateToProps)(ProjectPageOLD);
