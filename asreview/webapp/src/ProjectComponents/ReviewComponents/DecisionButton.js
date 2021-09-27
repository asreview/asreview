import React from "react";
import clsx from "clsx";
import Fab from "@mui/material/Fab";

import { Favorite, FavoriteBorder } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      marginLeft: theme.spacing(5),
      marginRight: theme.spacing(5),
      marginBottom: theme.spacing(5),
    },
    flexShrink: 0,
    width: "100%",
    textAlign: "center",
  },
  rootMobile: {
    "& > *": {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },
  },
  extendedFab: {
    marginRight: theme.spacing(1),
  },
}));

const DecisionButton = (props) => {
  const classes = useStyles();

  let relevantLabel = "Relevant";
  let irrelevantLabel = "Irrelevant";

  if (props.previousSelection === 0) {
    relevantLabel = "Convert to relevant";
    irrelevantLabel = "Keep irrelevant";
  }
  if (props.previousSelection === 1) {
    relevantLabel = "Keep relevant";
    irrelevantLabel = "Convert to irrelevant";
  }

  return (
    <div
      className={clsx(classes.root, {
        [classes.rootMobile]: props.mobileScreen,
      })}
    >
      <Fab
        onClick={() => props.makeDecision(0)}
        size={props.mobileScreen ? "small" : "large"}
        variant="extended"
      >
        <FavoriteBorder className={classes.extendedFab} />
        {irrelevantLabel}
      </Fab>
      <Fab
        onClick={() => props.makeDecision(1)}
        color="primary"
        size={props.mobileScreen ? "small" : "large"}
        variant="extended"
      >
        <Favorite className={classes.extendedFab} />
        {relevantLabel}
      </Fab>
    </div>
  );
};

export default DecisionButton;
