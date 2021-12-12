import React from "react";
import { Snackbar } from "@mui/material";

export default function CloseSetupInfoBar(props) {
  const handleExited = () => {
    props.setNewProjectTitle("");
  };

  let anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
  };

  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      onClose={props.onClose}
      open={props.open}
      autoHideDuration={6000}
      message={props.info}
      TransitionProps={{
        onExited: () => handleExited(),
      }}
    />
  );
}
