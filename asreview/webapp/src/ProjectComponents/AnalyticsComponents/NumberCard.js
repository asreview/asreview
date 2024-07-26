import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  CircularProgress,
  Tooltip,
  IconButton,
  Popover,
  TextField,
  Button,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditIcon from "@mui/icons-material/Edit";
import { CardErrorHandler } from "Components";

// Styled component for the main card
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: "visible",
  width: "100%",
  padding: theme.spacing(2),
  boxShadow: theme.shadows[2],
}));

// Component to display a single statistic item
const StatItem = ({ label, value, color }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" color={color} fontWeight="bold">
      {value.toLocaleString()}
    </Typography>
  </Box>
);

// Styled component for custom tooltips
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    fontSize: theme.typography.pxToRem(12),
    padding: "10px",
  },
}));

// Component to handle the stopping rule section
const StoppingRuleSection = ({
  progress,
  threshold,
  irrelevantCount,
  onThresholdChange,
  mobileScreen,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempThreshold, setTempThreshold] = useState(threshold);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setTempThreshold(threshold);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handler to save the new threshold value
  const handleSave = () => {
    onThresholdChange(tempThreshold);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "threshold-popover" : undefined;

  return (
    <Box mt={2} p={2} bgcolor="rgba(128, 128, 128, 0.1)" borderRadius={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={mobileScreen ? "column" : "row"}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Stopping Suggestion
        </Typography>
        <CustomTooltip
          title={
            <React.Fragment>
              <ul style={{ margin: 0, paddingLeft: "1.5em" }}>
                <li>
                  Optional: The stopping rule indicates the number of irrelevant
                  labels since the last relevant label. Reaching the threshold
                  suggests stopping the review process.
                </li>
              </ul>
            </React.Fragment>
          }
          arrow
        >
          <IconButton size="small">
            <HelpOutlineIcon />
          </IconButton>
        </CustomTooltip>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection={mobileScreen ? "column" : "row"}
      >
        <Box display="flex" alignItems="center" mb={mobileScreen ? 2 : 0}>
          <Box position="relative" display="inline-flex" mr={2}>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={80}
              thickness={4}
              style={{ color: "#FFD700" }}
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                variant="caption"
                component="div"
                color="text.primary"
                fontWeight="bold"
              >
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="body1" color="text.primary" fontWeight="bold">
              {`${irrelevantCount}/${threshold}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Irrelevant since last Relevant
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mt={mobileScreen ? 2 : 0}>
          <Typography variant="body2" color="text.secondary" mr={1}>
            Threshold:
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            fontWeight="bold"
            mr={1}
          >
            {threshold}
          </Typography>
          <IconButton size="small" onClick={handleClick}>
            <EditIcon fontSize="small" />
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box
              p={2}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography variant="body2" gutterBottom>
                Edit Threshold
              </Typography>
              <TextField
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                size="small"
                variant="outlined"
                style={{ marginBottom: 8 }}
                InputProps={{
                  inputProps: { min: 0 },
                  style: {
                    MozAppearance: "none",
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                }}
              />
              <Button variant="contained" color="primary" onClick={handleSave}>
                SAVE
              </Button>
            </Box>
          </Popover>
        </Box>
      </Box>
    </Box>
  );
};

// Main component to display the modern progress chart
export default function ModernProgressChart({ progressQuery, mobileScreen }) {
  const theme = useTheme();
  const [stoppingRuleThreshold, setStoppingRuleThreshold] = useState(30);

  // Destructure progress data using useMemo for memoization
  const {
    n_included, //TODO include the switch
    n_excluded, //TODO include the switch
    n_papers,
    n_included_no_priors,
    n_excluded_no_priors,
    n_since_last_inclusion_no_priors,
  } = useMemo(
    () => ({
      n_included: progressQuery.data?.n_included ?? 0,
      n_excluded: progressQuery.data?.n_excluded ?? 0,
      n_papers: progressQuery.data?.n_papers ?? 0,
      n_included_no_priors: progressQuery.data?.n_included_no_priors ?? 0,
      n_excluded_no_priors: progressQuery.data?.n_excluded_no_priors ?? 0,
      n_since_last_inclusion_no_priors:
        progressQuery.data?.n_since_last_inclusion_no_priors ?? 0,
    }),
    [progressQuery.data],
  );

  // Prepare data series for the chart using useMemo for memoization
  const series = useMemo(
    () => [
      n_included_no_priors,
      n_excluded_no_priors,
      n_papers - n_included_no_priors - n_excluded_no_priors,
    ],
    [n_included_no_priors, n_excluded_no_priors, n_papers],
  );

  // Prepare options for the chart using useMemo for memoization
  const options = useMemo(
    () => ({
      chart: {
        animations: { enabled: false },
        background: "transparent",
        type: "donut",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "10%",
            labels: {
              show: false,
            },
          },
        },
      },
      labels: ["Relevant", "Irrelevant", "Unlabeled"],
      colors: ["#FFD700", "#808080", "#D3D3D3"],
      stroke: { width: 0 },
      legend: { show: false },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val) => `${val} (${Math.round((val / n_papers) * 100)}%)`,
        },
      },
      theme: { mode: theme.palette.mode },
      dataLabels: { enabled: false },
    }),
    [theme, n_papers],
  );

  const stoppingRuleProgress =
    (n_since_last_inclusion_no_priors / stoppingRuleThreshold) * 100;

  return (
    <StyledCard>
      <CardErrorHandler
        queryKey={"fetchProgress"}
        error={progressQuery.error}
        isError={progressQuery.isError}
      />
      <CardContent>
        <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
          Review Progress
        </Typography>
        {progressQuery.isLoading ? (
          <Box
            display="flex"
            flexDirection={mobileScreen ? "column" : "row"}
            alignItems="center"
            justifyContent="center"
          >
            <Skeleton variant="circular" width={300} height={300} />
            <Box
              flex={1}
              ml={mobileScreen ? 0 : 3}
              mt={mobileScreen ? 3 : 0}
              width="100%"
            >
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="50%" height={40} />
              <Skeleton
                variant="rectangular"
                height={100}
                width="100%"
                style={{ marginTop: 16, borderRadius: 8 }}
              />
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection={mobileScreen ? "column" : "row"}
            alignItems="center"
            justifyContent="center"
          >
            <Box
              flex={1}
              width="100%"
              maxWidth={300}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Chart
                options={options}
                series={series}
                type="donut"
                height={300}
              />
            </Box>
            <Box
              flex={1}
              ml={mobileScreen ? 0 : 3}
              mt={mobileScreen ? 3 : 0}
              width="100%"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <Box
                mb={2}
                p={2}
                bgcolor="rgba(255, 255, 255, 0.05)"
                borderRadius={2}
              >
                <StatItem
                  label="Total Records"
                  value={n_papers}
                  color="text.primary"
                />
                <StatItem
                  label="Relevant Records"
                  value={n_included_no_priors}
                  color="#FFD700"
                />
                <StatItem
                  label="Irrelevant Records"
                  value={n_excluded_no_priors}
                  color="#808080"
                />
              </Box>
              <StoppingRuleSection
                progress={stoppingRuleProgress}
                threshold={stoppingRuleThreshold}
                irrelevantCount={n_since_last_inclusion_no_priors}
                onThresholdChange={setStoppingRuleThreshold}
                mobileScreen={mobileScreen}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}
