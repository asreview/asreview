import React from "react";
import makeStyles from "@mui/styles/makeStyles";

import { Container, Button, Typography } from "@mui/material";

import { connect } from "react-redux";

import { mapStateToProps } from "../globals.js";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: "24px",
  },
  title: {
    marginBottom: "20px",
  },
  button: {
    margin: "20px 0px",
  },
}));

const ReviewZoneComplete = (props) => {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        Congratulations, you completed your Systematic Review
      </Typography>
      <Typography>You can export your results.</Typography>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={() => props.toggleExportResult()}
      >
        Export
      </Button>
      <Typography>Return to your projects.</Typography>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={() => props.handleAppState("projects")}
      >
        Back to projects
      </Button>
      <Typography>We would love to hear your feedback.</Typography>
    </Container>
  );
};

export default connect(mapStateToProps)(ReviewZoneComplete);
