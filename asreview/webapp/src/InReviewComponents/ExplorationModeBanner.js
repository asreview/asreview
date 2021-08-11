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
        open={props.banner}
        onClose={() => props.setBanner(false)}
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
          className: classes.banner,
        }}
        appBar
      />
    </div>
  );
};

export default ExplorationModeBanner;
