import * as React from "react";
import { Alert, Box } from "@mui/material";

export function ExplorationModeRecordAlert(props) {
  return (
    <Alert
      severity="info"
      className={"fontSize" + props.fontSize?.label}
      sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
    >
      Labeled as{" "}
      {
        <Box sx={{ textDecoration: "underline" }} display="inline">
          {props.label}
        </Box>
      }{" "}
      in the dataset
    </Alert>
  );
}
