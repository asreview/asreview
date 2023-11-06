import * as React from "react";
import { Alert } from "@mui/material";

export function ExplorationModeRecordAlert(props) {
  return (
    <Alert
      severity="info"
      sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
    >
      <span className="labeled-as">
        {`Labeled as ${props.label} in the dataset`}
      </span>
    </Alert>
  );
}
