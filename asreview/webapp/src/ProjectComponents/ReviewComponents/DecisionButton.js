import React from "react";
import clsx from "clsx";
import Fab from "@mui/material/Fab";
import { styled } from "@mui/material/styles";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

const PREFIX = "DecisionButton";

const classes = {
  root: `${PREFIX}-root`,
  rootMobile: `${PREFIX}-rootMobile`,
  extendedFab: `${PREFIX}-extendedFab`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    "& > *": {
      marginLeft: theme.spacing(5),
      marginRight: theme.spacing(5),
      marginBottom: theme.spacing(5),
    },
    flexShrink: 0,
    width: "100%",
    textAlign: "center",
    position: "absolute",
    bottom: 0,
  },

  [`&.${classes.rootMobile}`]: {
    "& > *": {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(3),
    },
  },

  [`& .${classes.extendedFab}`]: {
    marginRight: theme.spacing(1),
  },
}));

const DecisionButton = (props) => {
  let relevantLabel = "Relevant";
  let irrelevantLabel = "Irrelevant";

  if (props.previousRecord.show) {
    if (props.previousRecord.label === 0) {
      relevantLabel = "Convert to relevant";
      irrelevantLabel = "Keep irrelevant";
    }
    if (props.previousRecord.label === 1) {
      relevantLabel = "Keep relevant";
      irrelevantLabel = "Convert to irrelevant";
    }
  }

  return (
    <Root
      className={clsx(classes.root, {
        [classes.rootMobile]: props.mobileScreen,
      })}
    >
      <Fab
        disabled={props.disableDecisionButton()}
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
        disabled={props.disableDecisionButton()}
        size={props.mobileScreen ? "small" : "large"}
        variant="extended"
      >
        <Favorite className={classes.extendedFab} />
        {relevantLabel}
      </Fab>
    </Root>
  );
};

export default DecisionButton;
