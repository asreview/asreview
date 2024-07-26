import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { projectModes } from "globals.js";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  maxWidth: 800, // Reduced from 960
  overflow: "visible",
  width: "100%",
  padding: theme.spacing(2), // Reduced from 3
}));

export default function ModernProgressChart({ progressQuery, mode, isSimulating, includePriorKnowledge, mobileScreen }) {
  const theme = useTheme();

  const {
    n_included,
    n_excluded,
    n_papers,
    n_included_no_priors,
    n_excluded_no_priors
  } = useMemo(() => ({
    n_included: progressQuery.data?.n_included ?? 0,
    n_excluded: progressQuery.data?.n_excluded ?? 0,
    n_papers: progressQuery.data?.n_papers ?? 0,
    n_included_no_priors: progressQuery.data?.n_included_no_priors ?? 0,
    n_excluded_no_priors: progressQuery.data?.n_excluded_no_priors ?? 0,
  }), [progressQuery.data]);

  const formattedTotal = useMemo(() => {
    if (mode !== projectModes.SIMULATION || !isSimulating) {
      return n_papers.toLocaleString("en-US");
    } else {
      return `${Math.round(((n_included + n_excluded) / n_papers) * 10000) / 100}%`;
    }
  }, [isSimulating, mode, n_included, n_excluded, n_papers]);

  const series = useMemo(() => {
    const relevant = includePriorKnowledge ? n_included : n_included_no_priors;
    const irrelevant = includePriorKnowledge ? n_excluded : n_excluded_no_priors;
    const unlabeled = n_papers - relevant - irrelevant;
    return [relevant, irrelevant, unlabeled];
  }, [n_included, n_excluded, n_papers, includePriorKnowledge, n_included_no_priors, n_excluded_no_priors]);

  const options = useMemo(() => ({
    chart: {
      animations: { enabled: false },
      background: "transparent",
      type: "donut",
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              show: false, // Hide labels by default
            },
            value: {
              show: false, // Hide values by default
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: mobileScreen ? '14px' : '16px',
              fontFamily: theme.typography.fontFamily,
              color: theme.palette.text.primary,
              formatter: () => formattedTotal
            }
          }
        }
      }
    },
    labels: ['Relevant', 'Irrelevant', 'Unlabeled'],
    colors: ['#FFD700', '#808080', theme.palette.background.paper],
    stroke: {
      width: 0
    },
    legend: {
      position: 'bottom',
      fontSize: mobileScreen ? '11px' : '13px',
      fontFamily: theme.typography.fontFamily,
      labels: {
        colors: theme.palette.text.secondary,
      },
      markers: {
        width: 8,
        height: 8,
        offsetX: -4
      },
      itemMargin: {
        horizontal: 12
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `${val} (${Math.round((val / n_papers) * 100)}%)`
      }
    },
    theme: {
      mode: theme.palette.mode
    },
    dataLabels: {
      enabled: false, // Disable data labels to prevent overlap
    },
    states: {
      hover: {
        filter: {
          type: 'none', // Disable hover effect
        }
      }
    }
  }), [theme, mobileScreen, formattedTotal, n_papers]);

  return (
    <StyledCard elevation={2}>
      <CardContent>
        <Typography variant={mobileScreen ? "subtitle1" : "h6"} gutterBottom align="center">
          Review Progress
        </Typography>
        {progressQuery.isLoading ? (
          <Skeleton variant="circular" width={240} height={240} style={{ margin: "auto" }} />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Chart options={options} series={series} type="donut" height={300} width={300} />
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}