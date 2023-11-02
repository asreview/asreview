import * as React from "react";
import { Alert } from "@mui/material";

export function ExplorationModeRecordAlert(props) {
  return (
    <Alert
      severity="info"
      className={"fontSize" + props.fontSize.label}
      sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
    >
      {`Labeled as ${props.label} in the dataset`}
    </Alert>
  );
}
