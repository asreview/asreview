import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import { Banner } from "material-ui-banner";

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      paddingTop: 8,
    },
  },
}));

const ExplorationModeBanner = (props) => {
  const classes = useStyles();

  return (
    <div>
      <Banner
        open={props.explorationMode}
        onClose={() => props.setExplorationMode(false)}
        label="You are screening through a manually pre-labeled dataset."
        buttonLabel="read more"
        buttonProps={{
          color: "primary",
          href: "https://asreview.readthedocs.io/en/latest/lab/exploration.html",
          target: "_blank",
        }}
        dismissButtonProps={{
          color: "primary",
        }}
        cardProps={{
          className: classes.root,
        }}
        appBar
      />
    </div>
  );
};

export default ExplorationModeBanner;
