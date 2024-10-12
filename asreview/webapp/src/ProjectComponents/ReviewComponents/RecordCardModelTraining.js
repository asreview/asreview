import { Alert, Typography } from "@mui/material";

import { ModelTraining } from "@mui/icons-material";

const RecordCardModelTraining = ({ record, modelLogLevel }) => {
  return (
    <>
      {(record?.state?.query_strategy === "top-down" ||
        record?.state?.query_strategy === "random") && (
        <Alert
          severity="warning"
          sx={{ borderRadius: 0 }}
          icon={<ModelTraining />}
        >
          This record is not presented by the model
        </Alert>
      )}
      {record?.error?.type !== undefined && (
        <Alert
          severity="error"
          sx={{ borderRadius: 0 }}
          icon={<ModelTraining />}
        >
          Model training error: {record?.error?.message}. Change model in
          settings page.
        </Alert>
      )}
      {modelLogLevel === "info" && record?.state && (
        <Alert
          severity="success"
          sx={{ borderRadius: 0 }}
          icon={<ModelTraining />}
        >
          <Typography>
            Record presented from trained model
            <br />
            <b>Classifier:</b> {record.state.classifier}
            <br />
            <b>Feature extraction:</b> {record.state.feature_extraction}
            <br />
            <b>Query strategy:</b> {record.state.query_strategy}
            <br />
            <b>Balance strategy:</b> {record.state.balance_strategy}
            <br />
            <b>Data points used for training:</b> {record.state.training_set}
            <br />
          </Typography>
        </Alert>
      )}
    </>
  );
};

export default RecordCardModelTraining;
