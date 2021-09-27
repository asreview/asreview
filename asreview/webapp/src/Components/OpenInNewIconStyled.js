import React from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import makeStyles from "@mui/styles/makeStyles";

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
