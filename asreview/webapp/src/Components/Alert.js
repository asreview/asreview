import * as React from "react";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  const severity = props.severity || "info";
  const variant = props.variant || "standard";
  const sx = props.sx || {
    padding: "2px",
    paddingLeft: "6px",
    margin: 0,
    borderRadius: 0,
    width: "100%",
  };

  return (
    <MuiAlert
      elevation={6}
      ref={ref}
      severity={severity}
      variant={variant}
      sx={sx}
      {...props}
    />
  );
});

export default Alert;
