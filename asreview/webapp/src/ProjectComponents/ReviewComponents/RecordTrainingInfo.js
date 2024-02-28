import React from "react";

import { Tooltip, Typography } from "@mui/material";
import { ModelTraining } from "@mui/icons-material";

const RecordTrainingInfo = ({ state }) => {
  const isNotTrained =
    state.query_strategy === "top-down" || state.query_strategy === "random";

  return (
    <>
      {isNotTrained && (
        <Tooltip
          title={
            <Typography>
              This record has been presented without training (
              {state.query_strategy}).
            </Typography>
          }
        >
          <ModelTraining color="warning" />
        </Tooltip>
      )}
      {!isNotTrained && (
        <Tooltip
          title={
            <Typography>
              Trained with the following settings
              <br />
              <b>Classifier:</b> {state.classifier}
              <br />
              <b>Feature extraction:</b> {state.feature_extraction}
              <br />
              <b>Query strategy:</b> {state.query_strategy}
              <br />
              <b>Balance strategy:</b> {state.balance_strategy}
              <br />
              <b>Training set:</b> {state.training_set}
              <br />
            </Typography>
          }
        >
          <ModelTraining color="success" />
        </Tooltip>
      )}
    </>
  );
};

export default RecordTrainingInfo;
