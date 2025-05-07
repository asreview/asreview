import React from "react";
import {
  Alert,
  Box,
  Paper,
  Skeleton,
  Stack,
  Typography,
  IconButton,
  Popover,
  Divider,
  Button,
} from "@mui/material";

import { ModelTraining } from "@mui/icons-material";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import { useMediaQuery } from "@mui/material";
import { ProjectAPI } from "api";
import { useQuery } from "react-query";

const FlowChartStep = ({ value, label }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        textAlign: "center",
        borderRadius: {
          md: 8,
        },
        width: "180px",
      }}
    >
      <Typography sx={{ fontWeight: "bold" }}>{value}</Typography>
      <Typography sx={{ fontSize: "0.9rem" }}>{label}</Typography>
    </Paper>
  );
};

const FlowChartArrow = () => <KeyboardArrowRightOutlinedIcon />;

const ModelFlowChart = ({ record }) => {
  const mobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const { data, isLoading } = useQuery(
    ["fetchLearners"],
    ProjectAPI.fetchLearners,
    {
      refetchOnWindowFocus: false,
    },
  );

  const classifierName = data?.models?.classifiers.filter(
    (classifier) => classifier.name === record.state.classifier,
  )[0]?.label;
  const featureExtractionName = data?.models?.feature_extractors.filter(
    (feature_extractor) =>
      feature_extractor.name === record.state.feature_extractor,
  )[0]?.label;
  const queryStrategyName = data?.models?.queriers.filter(
    (querier) => querier.name === record.state.querier,
  )[0]?.label;

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems={"center"}
      sx={{ overflow: "auto" }}
    >
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
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

  if (record?.error?.type !== undefined) {
    return (
      <Alert severity="error" sx={sx} icon={<ModelTraining />}>
        Model training error: {record?.error?.message}. Change model on the
        Customize tab.
      </Alert>
    );
  }
  const getAlertMessage = () => {
    if (record?.state?.querier === "top_down") {
      return record?.state?.label === 1 || record?.state?.label === 0
        ? "This record was presented in a top-down manner"
        : "This record is presented in a top-down manner";
    } else if (record?.state?.querier === "random") {
      return record?.state?.label === 1 || record?.state?.label === 0
        ? "This record was presented in a random manner"
        : "This record is presented in a random manner";
    } else if (record?.state?.querier === null) {
      return "This record was labeled either through manual search or the label was already available in the dataset";
    }
    return null;
  };

  const alertMessage = getAlertMessage();

  if (alertMessage) {
    return (
      <>
        <Alert
          severity="warning"
          icon={<ModelTraining />}
          sx={sx}
          action={
            <IconButton size="small" onClick={handlePopoverOpen}>
              <StyledLightBulb fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
        <Popover
          open={openPopover}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                maxWidth: 375,
                boxShadow: (theme) => theme.shadows[3],
              },
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
              <Typography variant="subtitle1" fontWeight="bold">
                Model Training Indicators
              </Typography>
              <Divider />
              <Box>
                <Alert
                  severity="warning"
                  icon={<ModelTraining />}
                  sx={{ mb: 2 }}
                >
                  Record presented in a random manner
                </Alert>
                <Typography
                  variant="body2"
                  sx={{ textAlign: "justify", mb: 2 }}
                >
                  This occurs regularly during the initial model training phase
                  as the model learns, or when this query strategy has been
                  explicitly chosen in <b>Customize</b>
                </Typography>
              </Box>
              <Box>
                <Alert
                  severity="warning"
                  icon={<ModelTraining />}
                  sx={{ mb: 2 }}
                >
                  Record presented in a top-down manner
                </Alert>
                <Typography
                  variant="body2"
                  sx={{ textAlign: "justify", mb: 2 }}
                >
                  This occurs only when this query strategy has been explicitly
                  chosen in <b>Customize</b>
                </Typography>
              </Box>
              <Box>
                <Alert
                  severity="warning"
                  icon={<ModelTraining />}
                  sx={{ mb: 2 }}
                >
                  Record was labeled either through manual search or the label
                  was already available in the dataset
                </Alert>
                <Typography variant="body2" sx={{ textAlign: "justify" }}>
                  This occurs if you labeled the record yourself using the
                  <b> Prior Knowledge</b> feature, or if its label was already
                  present in the dataset when it was imported
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Button
                  href="https://asreview.readthedocs.io/en/latest/guides/activelearning.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  Learn more
                </Button>
              </Box>
            </Stack>
          </Box>
        </Popover>
      </>
    );
  }

  if (modelLogLevel === "info" && record?.state?.querier) {
    return (
      <Box sx={sx}>
        <ModelFlowChart record={record} />
      </Box>
    );
  }

  return null;
};

export default RecordCardModelTraining;
