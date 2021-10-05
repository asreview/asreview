import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import { Box, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { NavigationDrawer } from "../Components";
import { HistoryPage } from "../ProjectComponents/HistoryComponents";
import {
  ReviewPage,
  ReviewPageFinished,
} from "../ProjectComponents/ReviewComponents";
import { ProjectInfo } from "../PreReviewComponents";
import ErrorHandler from "../ErrorHandler";
import DangerZone from "../DangerZone.js";
import PublicationZone from "../PublicationZone.js";
import StatisticsZone from "../StatisticsZone.js";

import Finished from "../images/ElasHoldingSIGNS_Finished.svg";
import InReview from "../images/ElasHoldingSIGNS_InReview.svg";
import SetUp from "../images/ElasHoldingSIGNS_SetUp.svg";

import { ProjectAPI } from "../api/index.js";
import { drawerWidth } from "../globals.js";

const PREFIX = "ProjectPage";

const classes = {
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
  container: `${PREFIX}-container`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.content}`]: {
    flexGrow: 1,
    padding: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowY: "scroll",
    height: `calc(100vh - 56px)`,
    // WebkitOverflowScrolling: "touch",
    [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
      height: `calc(100vh - 48px)`,
    },
    [theme.breakpoints.up("sm")]: {
      height: `calc(100vh - 64px)`,
    },
    [theme.breakpoints.up("md")]: {
      marginLeft: 72,
    },
  },

  [`& .${classes.contentShift}`]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },

  [`& .${classes.container}`]: {
    height: "100%",
  },
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
    project_id: state.project_id,
  };
};

const ProjectPage = (props) => {
  const [nav_state, setNav_state] = useState("analytics");

  const [state, setState] = useState({
    // info-header
    infoLoading: true,
    info: null,

    // stage
    finished: null,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const finishEditProjectInfo = () => {
    setNav_state("analytics");
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
    if ((state.info && !state.info.projectInitReady) || state.setup) {
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

  useEffect(() => {
    if (state.infoLoading) {
      fetchProjectInfo();
    }
  }, [fetchProjectInfo, state.infoLoading, error.message]);

  // for temporary use
  useEffect(() => {
    if ((state.info && !state.info.projectInitReady) || state.setup) {
      props.handleAppState("project-page-old");
    }
  });

  return (
    <StyledBox aria-label="project page">
      <NavigationDrawer
        mobileScreen={props.mobileScreen}
        onNavDrawer={props.onNavDrawer}
        nav_state={nav_state}
        toggleNavDrawer={props.toggleNavDrawer}
        toggleSettings={props.toggleSettings}
        handleNavState={setNav_state}
        returnElasState={returnElasState}
        projectInfo={state.info}
      />
      <Box
        component="main"
        className={clsx(classes.content, {
          [classes.contentShift]: !props.mobileScreen && props.onNavDrawer,
        })}
        aria-label="project page content"
      >
        <Fade in={props.app_state === "project-page"}>
          <Box
            className={classes.container}
            aria-label="project page content transition"
          >
            {error.message !== null && (
              <ErrorHandler error={error} setError={setError} />
            )}

            {error.message === null && !state.infoLoading && !state.setup && (
              <Box
                className={classes.container}
                aria-label="project page content loaded"
              >
                {/* Analytics */}
                {nav_state === "analytics" && (
                  <StatisticsZone
                    project_id={props.project_id}
                    projectInitReady={state.info.projectInitReady}
                  />
                )}

                {/* Review page */}
                {nav_state === "review" && !state.finished && (
                  <ReviewPage
                    handleAppState={props.handleAppState}
                    mobileScreen={props.mobileScreen}
                    projectMode={state.info.mode}
                    fontSize={props.fontSize}
                    undoEnabled={props.undoEnabled}
                    keyPressEnabled={props.keyPressEnabled}
                  />
                )}

                {/* Review page when marked as finished */}
                {nav_state === "review" && state.finished && (
                  <ReviewPageFinished mobileScreen={props.mobileScreen} />
                )}

                {/* History page */}
                {nav_state === "history" && (
                  <HistoryPage mobileScreen={props.mobileScreen} />
                )}

                {/* Export page */}
                {nav_state === "export" && (
                  <Box>
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

                {/* Details page */}
                {nav_state === "details" && (
                  <ProjectInfo
                    edit={true}
                    open={nav_state === "details"}
                    onClose={finishEditProjectInfo}
                    info={state.info}
                  />
                )}
              </Box>
            )}
          </Box>
        </Fade>
      </Box>
    </StyledBox>
  );
};

export default connect(mapStateToProps)(ProjectPage);
