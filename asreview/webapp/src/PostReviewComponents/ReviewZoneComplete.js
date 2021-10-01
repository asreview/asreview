import React from "react";
import { connect } from "react-redux";
import { Container, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { mapStateToProps } from "../globals.js";

const PREFIX = "ReviewZoneComplete";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  button: `${PREFIX}-button`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
  [`&.${classes.root}`]: {
    paddingTop: "24px",
  },

  [`& .${classes.title}`]: {
    marginBottom: "20px",
  },

  [`& .${classes.button}`]: {
    margin: "20px 0px",
  },
}));

const ReviewZoneComplete = (props) => {
  return (
    <StyledContainer maxWidth="md" className={classes.root}>
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
        onClick={() => props.handleAppState("dashboard")}
      >
        Back to projects
      </Button>
      <Typography>We would love to hear your feedback.</Typography>
    </StyledContainer>
  );
};

export default connect(mapStateToProps)(ReviewZoneComplete);
