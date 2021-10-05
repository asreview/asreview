import React from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const PREFIX = "ErrorHandler";

const classes = {
  errorMessage: `${PREFIX}-errorMessage`,
  link: `${PREFIX}-link`,
  retryButton: `${PREFIX}-retryButton`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.errorMessage}`]: {
    paddingTop: "24px",
    paddingBottom: "24px",
    opacity: 0.5,
  },

  [`& .${classes.link}`]: {
    paddingLeft: "3px",
  },

  [`& .${classes.retryButton}`]: {
    position: "relative",
    paddingBottom: "24px",
  },
}));

const ErrorHandler = (props) => {
  const handleClickRetry = () => {
    props.setError({
      code: null,
      message: null,
    });
  };

  return (
    <StyledBox>
      <Box className={classes.errorMessage}>
        <Typography variant="h5" align="center">
          {props.error.message}
        </Typography>
        <Box fontStyle="italic">
          <Typography align="center">
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
      </Box>
      {props.error.code !== 503 && (
        <Box className={classes.retryButton} align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickRetry}
          >
            Retry
          </Button>
        </Box>
      )}
    </StyledBox>
  );
};

export default ErrorHandler;
