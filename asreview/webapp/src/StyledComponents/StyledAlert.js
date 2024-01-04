import * as React from "react";
import { Alert, Box } from "@mui/material";

export function ExplorationModeRecordAlert(props) {
  return (
    <Alert
      severity="info"
      className={"fontSize" + props.fontSize?.label}
      sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
    >
      Initially labeled as{" "}
      {
        <Box
          className="labeled-as"
          sx={{ textDecoration: "underline" }}
          display="inline"
        >
          {props.label}
        </Box>
      }{props.prior ? "" : ", what would be your decision?"}
    </Alert>
  );
}
