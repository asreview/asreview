import React from "react";
import { Snackbar } from "@mui/material";

export default function ActionsFeedbackBar(props) {
  let anchorOrigin = {
    vertical: "bottom",
    horizontal: !props.center ? "right" : "center",
  };

  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      onClose={props.onClose}
      open={props.open}
      autoHideDuration={6000}
      message={props.feedback}
    />
  );
}
