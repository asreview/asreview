import {
  Alert,
  Paper,
  Divider,
  Stack,
  Typography,
  CardContent,
  Skeleton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { ModelTraining } from "@mui/icons-material";

import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import { useMediaQuery } from "@mui/material";
import { useQuery } from "react-query";
import { ProjectAPI } from "api";

const FlowChartStep = ({ value, label }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1,
      textAlign: "center",
      borderRadius: 8,
      width: "180px",
    }}
  >
    <Typography sx={{ fontWeight: "bold" }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.9rem" }}>{label}</Typography>
  </Paper>
);

const FlowChartArrow = () => <KeyboardArrowRightOutlinedIcon />;

const ModelFlowChart = ({ record }) => {
  const mobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const { data, isLoading } = useQuery(
    ["fetchModelOptions"],
    ProjectAPI.fetchModelOptions,
    {
      refetchOnWindowFocus: false,
    },
  );

  const classifierName = data?.classifier.filter(
    (classifier) => classifier.name === record.state.classifier,
  )[0].label;
  const featureExtractionName = data?.feature_extraction.filter(
    (feature_extraction) =>
      feature_extraction.name === record.state.feature_extraction,
  )[0].label;
  const queryStrategyName = data?.query_strategy.filter(
    (query_strategy) => query_strategy.name === record.state.query_strategy,
  )[0].label;

  return (
    <Stack direction="row" spacing={2} alignItems={"center"}>
      <FlowChartStep
        value={isLoading ? <Skeleton /> : record.state.training_set}
        label={mobile ? "labels" : "labeled records"}
      />
      <FlowChartArrow />
      <FlowChartStep
        value={isLoading ? <Skeleton /> : featureExtractionName}
        label={"features"}
      />
      <FlowChartArrow />
      <FlowChartStep
        value={isLoading ? <Skeleton /> : classifierName}
        label={"classification"}
      />
      <FlowChartArrow />
      <FlowChartStep
        value={isLoading ? <Skeleton /> : queryStrategyName}
        label={mobile ? "queried" : "record queried"}
      />
    </Stack>
  );
};

const RecordCardModelTraining = ({ record, modelLogLevel }) => {
  if (record?.error?.type !== undefined) {
    return (
      <Alert severity="error" sx={{ borderRadius: 0 }} icon={<ModelTraining />}>
        Model training error: {record?.error?.message}. Change model in settings
        page.
      </Alert>
    );
  }

  if (
    record?.state?.query_strategy === "top-down" ||
    record?.state?.query_strategy === "random"
  ) {
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: 0 }}
        icon={<ModelTraining />}
      >
        This record is not presented by the model
      </Alert>
    );
  }

  if (modelLogLevel === "info" && record?.state) {
    return <ModelFlowChart record={record} />;
  }

  return null;
};

export default RecordCardModelTraining;
