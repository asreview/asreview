import React from "react";
import { Banner } from "material-ui-banner";
import { styled } from "@mui/material/styles";

const PREFIX = "ExplorationModeBanner";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    [theme.breakpoints.down("md")]: {
      paddingTop: 8,
    },
  },
}));

const ExplorationModeBanner = (props) => {
  return (
    <Root aria-label="exploration mode banner">
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
    </Root>
  );
};

export default ExplorationModeBanner;
