import React from 'react';
import {
  Box,
  Button,
  Link,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  errorMessage: {
    paddingTop: '24px',
    paddingBottom: "24px",
    opacity: 0.5,
  },
  link: {
    paddingLeft: "3px",
  },
  retryButton: {
    position: "relative",
    top: "12px",
  },
}));

const ErrorHandler = (props) => {

  const classes = useStyles();

  const handleClickRetry = () => {
    props.setError(s => {return({
      "message": null,
      "retry": false,
    })});
  };

  return(
  	<Box>
      <Box className={classes.errorMessage}>
        <Typography variant="h5" align="center">
          {props.error["message"]}
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
            </Link> to report.
          </Typography>
        </Box>
      </Box>
      {props.error["retry"] === true &&
        <Box align="center">
          <Button 
            className={classes.retryButton}
            variant="contained"
            color="primary"
            onClick={handleClickRetry}
          >
            Retry
          </Button>
        </Box>
      }
    </Box>
  );
};

export default ErrorHandler;
