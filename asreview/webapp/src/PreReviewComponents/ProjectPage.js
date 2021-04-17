import React, { useState, useRef, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import {
  StartReview,
  PreReviewZone,
  ProjectInfo,
} from "../PreReviewComponents";

import ErrorHandler from "../ErrorHandler";
import DangerZone from "../DangerZone.js";
import PublicationZone from "../PublicationZone.js";
import StatisticsZone from "../StatisticsZone.js";
import { ProjectAPI } from "../api/index.js";

import KeyboardVoiceIcon from "@material-ui/icons/KeyboardVoice";
import GetAppIcon from "@material-ui/icons/GetApp";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";

import Finished from "../images/Finished.svg";
import InReview from "../images/InReview.svg";
import SetUp from "../images/SetUp.svg";

import { connect } from "react-redux";

import { mapStateToProps } from "../globals.js";

const useStyles = makeStyles((theme) => ({
  header: {
    paddingTop: "128px",
    paddingBottom: "48px",
    textAlign: "center",
  },
  title: {
    fontWeight: "300",
    letterSpacing: ".7rem",
  },
  continuButton: {},
  quickStartButtons: {
    marginTop: "24px",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  dangerZone: {
    borderColor: "red",
    borderWidth: "2px",
    borderStyle: "solid",
    boxShadow: "none",
  },
  cardBox: {
    paddingBottom: "24px",
  },
  stateElas: {
    width: "100%",
    maxWidth: "200px",
    display: "block",
    margin: "auto",
  },
}));

const ProjectPage = (props) => {
  const classes = useStyles();

  const EndRef = useRef(null);

  const [state, setState] = useState({
    // stage
    setupFirstTime: props.setupFirstTime ? props.setupFirstTime : false,
    setup: false,
    training: false,
    finished: null,
  });

  const [info, setInfo] = useState({
    // info-header
    loading: true,
    editing: false,
    info: null,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const editProjectInfo = () => {
    setInfo({
      ...info,
      editing: true,
    });
  };

  const finishEditProjectInfo = () => {
    setInfo({
      ...info,
      editing: false,
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
    setInfo({
      ...info,
      info: { ...info.info, projectInitReady: true },
    });
    setState({
      ...state,
      training: false,
    });
  };

  const continueProjectSetup = () => {
    setState({
      ...state,
      setup: true,
    });
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
    if (!info.info.projectInitReady || state.setup) {
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
        setInfo((s) => {
          return {
            ...s,
            loading: false,
            info: result.data,
          };
        });
        setState((s) => {
          return {
            ...s,
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
    if (!info.loading && EndRef.current !== undefined) {
      scrollToTop();
    }
  }, [state.setup, state.finished, info.loading]);

  useEffect(() => {
    if (info.loading) {
      fetchProjectInfo();
    }
  }, [fetchProjectInfo, info.loading, error.message]);

  return (
    <Box>
      {error.message !== null && (
        <ErrorHandler error={error} setError={setError} />
      )}

      {error.message === null && !info.loading && (
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
                  {info.info.name}
                  <Tooltip title="Edit info">
                    <IconButton size="small" onClick={editProjectInfo}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Typography color="primary" variant="h5">
                  {info.info.description}
                </Typography>
                {/*
              </Grid>
              <Grid item xs={12}>
              */}
                <Box className={classes.quickStartButtons}>
                  {/* Project is not ready, continue setup */}
                  {!info.info.projectInitReady &&
                    !state.setup &&
                    !state.training && (
                      <Button
                        className={classes.continuButton}
                        variant={"outlined"}
                        onClick={continueProjectSetup}
                      >
                        {info.info.projectHasDataset ? "Finish" : "Start"} setup
                      </Button>
                    )}

                  {info.info.projectInitReady &&
                    !state.setup &&
                    !state.training && (
                      <Tooltip title="Download results">
                        <IconButton
                          aria-label="Export"
                          onClick={props.toggleExportResult}
                          color="inherit"
                        >
                          <GetAppIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                  {/* Project is ready, show button */}
                  {info.info.projectInitReady &&
                    !state.setup &&
                    !state.training && (
                      <Button
                        className={classes.continuButton}
                        variant={"outlined"}
                        onClick={() => props.handleAppState("review")}
                        disabled={state.finished}
                      >
                        Start reviewing
                      </Button>
                    )}

                  {!info.info.projectInitReady &&
                    !state.setup &&
                    state.training && (
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
                </Box>

                {/* Project is not ready, continue setup */}
                {state.training && (
                  <StartReview onReady={finishProjectFirstTraining} />
                )}
              </Grid>
            </Grid>

            {/* Cards on the project board */}
            {!state.setup && (
              <Box className={classes.cardBox}>
                <StatisticsZone
                  project_id={props.project_id}
                  projectInitReady={info.info.projectInitReady}
                  training={state.training}
                />
                <PublicationZone
                  project_id={props.project_id}
                  showExportResult={
                    info.info.projectInitReady &&
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
            {state.setup && (
              <PreReviewZone
                mode={"oracle"}
                finishProjectSetup={finishProjectSetup}
                scrollToTop={scrollToTop}
                setError={setError}
              />
            )}
          </Container>
        </Box>
      )}
      {/* Edit project info*/}
      {error.message === null && !info.loading && (
        <ProjectInfo
          setInfo={setInfo}
          edit={info.editing}
          open={info.editing}
          onClose={finishEditProjectInfo}
          name={info.info.name}
          authors={info.info.authors}
          description={info.info.description}
        />
      )}
    </Box>
  );
};

export default connect(mapStateToProps)(ProjectPage);
