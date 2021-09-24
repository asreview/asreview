import React from "react";
import { Box, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import ElasFinished from "../../images/ElasFinished.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  img: {
    maxWidth: 350,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 250,
    },
  },
  textTitle: {
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      width: "80%",
    },
  },
  text: {
    textAlign: "center",
    width: "40%",
    [theme.breakpoints.down("sm")]: {
      width: "80%",
    },
  },
}));

const ReviewPageFinished = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.root} aria-label="project review finished">
      <img src={ElasFinished} alt="ElasFinished" className={classes.img} />
      <Typography className={classes.textTitle} variant="h5">
        Congratulations! You have finished this project.
      </Typography>
      <Typography className={classes.text}>
        You have stopped reviewing and marked this project as finished. If you
        want to resume the review, please <Link>update project status</Link>.
      </Typography>
    </Box>
  );
};

export default ReviewPageFinished;
