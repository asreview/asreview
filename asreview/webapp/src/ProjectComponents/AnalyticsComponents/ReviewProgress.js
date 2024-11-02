import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid2 as Grid,
  Divider,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CardErrorHandler } from "Components";
import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { StyledHelpPopover } from "StyledComponents/StyledHelpPopover";
import { useQuery } from "react-query";
import { ProjectAPI } from "api";

const StatItem = ({ label, value, color, loading }) => (
  <Box
    sx={{
      bgcolor: "background.paper",
      p: 1.5,
      borderRadius: 4,

      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      mb: { xs: 1, sm: 2 },
    }}
  >
    {loading ? (
      <Skeleton width="40%" />
    ) : (
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    )}
    {loading ? (
      <Skeleton width="20%" />
    ) : (
      <Typography variant="h6" color={color} fontWeight="bold">
        {value.toLocaleString()}
      </Typography>
    )}
  </Box>
);

export default function ReviewProgress({ project_id }) {
  const theme = useTheme();

  const { data, isLoading, error, isError } = useQuery(
    ["fetchProgress", { project_id: project_id }],
    ({ queryKey }) =>
      ProjectAPI.fetchProgress({
        queryKey,
      }),
    { refetchOnWindowFocus: false },
  );

  //Prior knowledge switch state and the relevant statistics that depend on it
  const [includePriorKnowledge, setIncludePriorKnowledge] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    n_papers = 0,
    n_included = 0,
    n_excluded = 0,
    n_included_no_priors = 0,
    n_excluded_no_priors = 0,
  } = data || {};

  const donutSeries = useMemo(() => {
    const relevant = includePriorKnowledge ? n_included : n_included_no_priors;
    const irrelevant = includePriorKnowledge
      ? n_excluded
      : n_excluded_no_priors;
    const unlabeled = n_papers - relevant - irrelevant;
    return [relevant, irrelevant, unlabeled];
  }, [
    includePriorKnowledge,
    n_included,
    n_excluded,
    n_included_no_priors,
    n_excluded_no_priors,
    n_papers,
  ]);

  const relevantPercentage = useMemo(() => {
    const totalRelevantIrrelevant = includePriorKnowledge
      ? n_included + n_excluded
      : n_included_no_priors + n_excluded_no_priors;
    return n_papers > 0
      ? Math.round((totalRelevantIrrelevant / n_papers) * 100)
      : 0;
  }, [
    includePriorKnowledge,
    n_included,
    n_excluded,
    n_included_no_priors,
    n_excluded_no_priors,
    n_papers,
  ]);

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
              total: {
                show: false,
                formatter: () => `${relevantPercentage}%`,
                style: {
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: theme.palette.text.primary,
                  textAlign: "center",
                },
              },
            },
          },
        },
      },
      labels: ["Relevant", "Irrelevant", "Unlabeled"],
      colors: [
        theme.palette.mode === "light"
          ? theme.palette.primary.light
          : theme.palette.primary.main, // Relevant
        theme.palette.mode === "light"
          ? theme.palette.grey[600]
          : theme.palette.grey[600], // Irrelevant
        theme.palette.mode === "light"
          ? theme.palette.grey[400]
          : theme.palette.grey[400], // Unlabeled
      ],
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
    [theme, relevantPercentage, n_papers],
  );

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);

  return (
    <Card sx={{ bgcolor: "background.default" }}>
      <CardErrorHandler
        queryKey={"fetchProgress"}
        error={error}
        isError={isError}
      />
      <CardContent>
        {/* <FormControlLabel
          control={
            <Switch
              checked={!includePriorKnowledge}
              onChange={() => setIncludePriorKnowledge(!includePriorKnowledge)}
            />
          }
          label="Hide Prior Knowledge"
          labelPlacement="end"
        /> */}
        <IconButton
          size="small"
          onClick={handlePopoverOpen}
          sx={{ float: "right" }}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
        <StyledHelpPopover
          id="info-popover"
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
        >
          <Typography variant="h6">
            <strong>Hide Prior Knowledge</strong>
          </Typography>
          <Typography variant="body1">
            <strong>Hiding</strong> prior knowledge will only show labelings
            done using ASReview.
          </Typography>
          <Typography variant="body1">
            <strong>Showing</strong> prior knowledge will show combined
            labelings from the original dataset and those done using ASReview.
          </Typography>
          <Typography variant="h6">
            <strong>Statistics</strong>
          </Typography>
          <Typography variant="body1">
            <strong>Labeled Records:</strong> Combination of records that you
            labeled as relevant or irrelevant
          </Typography>
          <Typography variant="body1">
            <strong>Relevant Records:</strong> Records you labeled as relevant
          </Typography>
          <Typography variant="body1">
            <strong>Irrelevant Records:</strong> Records you labeled as
            irrelevant
          </Typography>
          <Typography variant="body1">
            <strong>Unlabeled Records:</strong> The remaining records that have
            not been labeled yet
          </Typography>
          <Link
            href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
            target="_blank"
            rel="noopener"
          >
            Learn more
          </Link>
        </StyledHelpPopover>
      </CardContent>
      <CardContent>
        <Grid container spacing={2} columns={1}>
          <Grid
            size={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {isLoading ? (
              <Skeleton variant="circular" width={180} height={180} />
            ) : (
              <Chart
                options={options}
                series={donutSeries}
                type="donut"
                height={180}
                width={180}
              />
            )}
          </Grid>
          <Grid size={1}>
            <Stack spacing={2} direction={"row"}>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  p: 1.5,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  mb: { xs: 1, sm: 2 },
                }}
              >
                <Stack spacing={1} direction={"column"}>
                  <Stack direction={"row"} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {"Relevant Records"}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {n_included_no_priors}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction={"row"} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {"with priors"}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {n_included}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  p: 1.5,
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  mb: { xs: 1, sm: 2 },
                }}
              >
                <Stack spacing={1} direction={"column"}>
                  <Stack direction={"row"} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {"Relevant Records"}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {n_excluded_no_priors}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction={"row"} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {"with priors"}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.secondary"
                    >
                      {n_excluded}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              {/*
              <StatItem
                label="Relevant Records"
                value={n_included_no_priors}
                color={
                  theme.palette.mode === "light"
                    ? theme.palette.primary.light
                    : theme.palette.primary.main
                }
                loading={isLoading}
              /> */}
            </Stack>
          </Grid>
          {/* <Grid size={1}>
            <Stack spacing={2} direction={"row"}>
              <StatItem
                label="Relevant with prior records"
                value={n_included + 5}
                color={
                  theme.palette.mode === "light"
                    ? theme.palette.primary.light
                    : theme.palette.primary.main
                }
                loading={isLoading}
              />
              <StatItem
                label="Not relevant with prior records"
                value={n_excluded + 10}
                color={
                  theme.palette.mode === "light"
                    ? theme.palette.grey[600]
                    : theme.palette.grey[600]
                }
                loading={isLoading}
              />
            </Stack>
          </Grid> */}
        </Grid>
      </CardContent>
    </Card>
  );
}
