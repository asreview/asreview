import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { CardErrorHandler } from "Components";
import { tooltipClasses } from "@mui/material";

// Styled component for the main card
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[2],
  height: "300px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    height: "auto",
    padding: theme.spacing(1),
  },
}));

// Styled component for the statistic item box
const StatBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(1),
  },
}));

// Component to display a single statistic item
const StatItem = ({ label, value, color, loading }) => (
  <StatBox>
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
  </StatBox>
);

export default function ReviewProgress({ progressQuery, mobileScreen }) {
  const theme = useTheme();
  const loading = progressQuery.isLoading;

  //Prior knowledge switch state and the relevant statistics that depend on it
  const [includePriorKnowledge, setIncludePriorKnowledge] = useState(false);
  const {
    n_papers = 0,
    n_included = 0,
    n_excluded = 0,
    n_included_no_priors = 0,
    n_excluded_no_priors = 0,
  } = useMemo(
    () => ({
      n_papers: progressQuery.data?.n_papers ?? 0,
      n_included: progressQuery.data?.n_included ?? 0,
      n_excluded: progressQuery.data?.n_excluded ?? 0,
      n_included_no_priors: progressQuery.data?.n_included_no_priors ?? 0,
      n_excluded_no_priors: progressQuery.data?.n_excluded_no_priors ?? 0,
    }),
    [progressQuery.data]
  );

  const donutSeries = useMemo(
    () => {
      const relevant = includePriorKnowledge ? n_included : n_included_no_priors;
      const irrelevant = includePriorKnowledge ? n_excluded : n_excluded_no_priors;
      const unlabeled = n_papers - relevant - irrelevant;
      return [relevant, irrelevant, unlabeled];
    },
    [includePriorKnowledge, n_included, n_excluded, n_included_no_priors, n_excluded_no_priors, n_papers]
  );

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
                label: "",
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
    [theme, relevantPercentage, n_papers]
  );

  // Info tooltip
  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[1],
      fontSize: theme.typography.pxToRem(12),
      padding: "10px",
      borderRadius: theme.shape.borderRadius,
    },
  }));

  return (
    <StyledCard>
      <CardErrorHandler
        queryKey={"fetchProgress"}
        error={progressQuery?.error}
        isError={progressQuery?.isError}
      />
      <Box
        sx={{
          position: "absolute",
          top: theme.spacing(1),
          left: theme.spacing(2),
          display: "flex",
          alignItems: "center",
          [theme.breakpoints.down("sm")]: {
            position: "static",
            marginBottom: theme.spacing(1),
          },
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={!includePriorKnowledge}
              onChange={() => setIncludePriorKnowledge(!includePriorKnowledge)}
            />
          }
          label="Hide Prior Knowledge"
          labelPlacement="end"
          sx={{
            m: 0,
            fontSize: theme.typography.pxToRem(10),
            marginTop: theme.spacing(1.5),
            marginLeft: theme.spacing(1),
          }}
          componentsProps={{
            typography: {
              variant: "body2",
            },
          }}
        />
      </Box>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginTop: theme.spacing(3),
          [theme.breakpoints.down("sm")]: {
            flexDirection: "column",
            marginTop: theme.spacing(1),
          },
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          flex={1}
          sx={{
            [theme.breakpoints.down("sm")]: {
              alignItems: "center",
              width: "100%",
            },
          }}
        >
          <StatItem
            label="Total Records"
            value={n_papers}
            color="text.primary"
            loading={loading}
          />
          <StatItem
            label="Labeled Records"
            value={includePriorKnowledge ? n_included + n_excluded : n_included_no_priors + n_excluded_no_priors}
            color="text.primary"
            loading={loading}
          />
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex={1}
          sx={{
            [theme.breakpoints.down("sm")]: {
              marginBottom: theme.spacing(2),
            },
          }}
        >
          {loading ? (
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
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-end"
          flex={1}
          sx={{
            [theme.breakpoints.down("sm")]: {
              alignItems: "center",
              width: "100%",
            },
          }}
        >
          <StatItem
            label="Relevant Records"
            value={includePriorKnowledge ? n_included : n_included_no_priors}
            color="#FFD700"
            loading={loading}
          />
          <StatItem
            label="Irrelevant Records"
            value={includePriorKnowledge ? n_excluded : n_excluded_no_priors}
            color="#808080"
            loading={loading}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: theme.spacing(1),
            right: theme.spacing(1),
            [theme.breakpoints.down("sm")]: {
              top: theme.spacing(2),
              right: theme.spacing(2),
            },
          }}
        >
          <CustomTooltip
            title={
              <React.Fragment>
                <hr
                  style={{
                    border: `none`,
                    borderTop: `4px solid ${theme.palette.divider}`,
                    margin: "8px 0",
                    borderRadius: "5px",
                  }}
                />
                <Typography variant="body2" gutterBottom>
                  <strong>Hide Prior Knowledge</strong>
                </Typography>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.2em",
                    listStyleType: "circle",
                  }}
                >
                  <li>
                    <strong>Hiding</strong> prior knowledge will only show
                    labelings done using ASReview.
                  </li>
                  <li>
                    <strong>Showing</strong> prior knowledge will show combined
                    labelings from the original dataset and those done using
                    ASReview.
                  </li>
                </ul>
                <hr
                  style={{
                    border: `none`,
                    borderTop: `4px solid ${theme.palette.divider}`,
                    margin: "8px 0",
                    borderRadius: "5px",
                  }}
                />
                <Typography variant="body2" gutterBottom>
                  <strong>Statistics</strong>
                </Typography>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.2em",
                    listStyleType: "circle",
                  }}
                >
                  <li>
                    <strong>Total Records:</strong> The total number of records
                    in your dataset
                  </li>
                  <li>
                    <strong>Labeled Records:</strong> The records you have
                    labeled as relevant or irrelevant
                  </li>
                  <li>
                    <strong>Relevant Records:</strong> Records you labeled as
                    relevant
                  </li>
                  <li>
                    <strong>Irrelevant Records:</strong> Records you labeled as
                    irrelevant
                  </li>
                  <li>
                    <strong>Unlabeled Records:</strong> The remaining records
                    that have not been labeled yet
                  </li>
                </ul>
                <hr
                  style={{
                    border: `none`,
                    borderTop: `4px solid ${theme.palette.divider}`,
                    margin: "8px 0",
                    borderRadius: "5px",
                  }}
                />
                <Box sx={{ pt: 1, textAlign: "center" }}>
                  <a
                    href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                    style={{
                      color:
                        theme.palette.mode === "dark" ? "#1E90FF" : "#1E90FF",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </a>
                </Box>
              </React.Fragment>
            }
            arrow
            interactive={true} 
            enterTouchDelay={0}
            placement="top"
            sx={{
              color: theme.palette.text.secondary,
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2],
            }}
          >
            <IconButton
              size="small"
              sx={{ 
                color: theme.palette.text.secondary,
                p: theme.spacing(2.1), 
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </CustomTooltip>
        </Box>
      </CardContent>
    </StyledCard>
  );
}
