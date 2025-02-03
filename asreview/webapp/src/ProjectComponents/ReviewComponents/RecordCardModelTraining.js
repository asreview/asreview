import { Alert, Box, Paper, Skeleton, Stack, Typography } from "@mui/material";

import { ModelTraining } from "@mui/icons-material";

import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import { useMediaQuery } from "@mui/material";
import { ProjectAPI } from "api";
import { useQuery } from "react-query";

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
  const featureExtractionName = data?.feature_extractor.filter(
    (feature_extractor) =>
      feature_extractor.name === record.state.feature_extractor,
  )[0].label;
  const queryStrategyName = data?.querier.filter(
    (querier) => querier.name === record.state.querier,
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

const RecordCardModelTraining = ({ record, modelLogLevel, sx }) => {
  if (record?.error?.type !== undefined) {
    return (
      <Alert severity="error" sx={sx} icon={<ModelTraining />}>
        Model training error: {record?.error?.message}. Change model in settings
        page.
      </Alert>
    );
  }

  if (
    record?.state?.querier === "top-down" ||
    record?.state?.querier === "random"
  ) {
    return (
      <Alert severity="warning" icon={<ModelTraining />} sx={sx}>
        This record is not presented by the model
      </Alert>
    );
  }

  if (modelLogLevel === "info" && record?.state) {
    return (
      <Box sx={sx}>
        <ModelFlowChart record={record} />
      </Box>
    );
  }

  return null;
};

export default RecordCardModelTraining;
