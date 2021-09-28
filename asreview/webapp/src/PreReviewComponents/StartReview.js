import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { Box, Link, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ProjectAPI } from "../api/index.js";
import { mapStateToProps } from "../globals.js";

import "./ReviewZone.css";

const PREFIX = "StartReview";

const classes = {
  link: `${PREFIX}-link`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.link}`]: {
    paddingLeft: "3px",
  },
}));

const StartReview = ({ project_id, onReady, notReady, trainingError }) => {
  const [state, setState] = useState({
    status: null,
    message: null,
  });

  const checkModelIsFitted = useCallback(() => {
    return ProjectAPI.init_ready(project_id)
      .then((result) => {
        if (result.data["status"] === 1) {
          // model ready
          onReady();
        } else {
          // not ready yet
          setTimeout(checkModelIsFitted, 2000);
        }
      })
      .catch((error) => {
        setState({
          status: "error",
          message: error.message,
        });
        notReady();
      });
  }, [project_id, onReady, notReady]);

  const startTraining = useCallback(() => {
    // set the state to 'model training'
    setState({
      status: "training",
      message: null,
    });

    return ProjectAPI.start(project_id)
      .then((result) => {
        checkModelIsFitted();
      })
      .catch((error) => {
        setState({
          status: "error",
          message: error.message,
        });
      });
  }, [checkModelIsFitted, project_id]);

  useEffect(() => {
    if (state.status === null && !trainingError) {
      setTimeout(startTraining, 3000);
    }
  }, [state.status, trainingError, startTraining]);

  return (
    <StyledBox>
      {(state["status"] === null || state["status"] === "training") &&
        !trainingError && <Typography>(This can take some time)</Typography>}

      {state["status"] === "error" && (
        <Box>
          <Typography variant="h6" color="error">
            {state["message"]}
          </Typography>
          <Typography color="error">
            If the issue remains after retrying, click
            <Link
              className={classes.link}
              href="https://github.com/asreview/asreview/issues/new/choose"
              target="_blank"
            >
              <strong>here</strong>
            </Link>{" "}
            to report.
          </Typography>
        </Box>
      )}
    </StyledBox>
  );
};

export default connect(mapStateToProps)(StartReview);
