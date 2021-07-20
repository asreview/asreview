import React from "react";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    alignSelf: "center",
    top: ".125em",
    position: "relative",
  },
}));

const OpenInNewIconStyled = (props) => {
  const classes = useStyles();

  return (
    <OpenInNewIcon className={classes.root} color="disabled" fontSize="small" />
  );
};

export default OpenInNewIconStyled;
