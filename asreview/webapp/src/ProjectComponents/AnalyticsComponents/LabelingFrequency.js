import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Popover,
  useTheme,
  Skeleton,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { CardErrorHandler } from "Components";
import { useQuery } from "react-query";
import { ProjectAPI } from "api";
import Chart from "react-apexcharts";

const DistancePatternChart = ({ project_id }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();

  const progressQuery = useQuery(
    ["fetchProgress", { project_id }],
    ProjectAPI.fetchProgress,
    { refetchOnWindowFocus: false },
  );

  const genericDataQuery = useQuery(
    ["fetchGenericData", { project_id }],
    ProjectAPI.fetchGenericData,
    { refetchOnWindowFocus: false },
  );

  const stoppingQuery = useQuery(
    ["fetchStopping", { project_id }],
    ProjectAPI.fetchStopping,
    { refetchOnWindowFocus: false },
  );

  const processData = () => {
    if (!genericDataQuery.data?.length) return null;

    const decisions = genericDataQuery.data;
    const lines = [];
    const relevantPositions = [];
    let position = 0;
    let lastRelevantPosition = null;

    for (let i = 0; i < decisions.length; i++) {
      position++;
      if (decisions[i].label === 1) {
        if (lastRelevantPosition !== null) {
          const distance = position - lastRelevantPosition;
          lines.push([
            { x: lastRelevantPosition, y: distance },
            { x: position, y: distance },
          ]);
        }
        lastRelevantPosition = position;
        relevantPositions.push(position);
      }
    }

    return { lines, relevantPositions, currentPosition: position };
  };

  const analytics = processData();
  const stoppingThreshold = stoppingQuery.data?.[0]?.params?.threshold;
  const currentPosition = analytics?.currentPosition || 0;
  const lastRelevant = analytics?.relevantPositions?.slice(-1)[0] || 0;
  const currentDistance = currentPosition - lastRelevant;

  const currentLine =
    lastRelevant && currentPosition > lastRelevant
      ? [
          { x: lastRelevant, y: currentDistance },
          { x: currentPosition, y: currentDistance },
        ]
      : [];

  const maxY = Math.max(
    ...(analytics?.lines?.map((line) => Math.max(line[0].y, line[1].y)) || []),
    currentDistance,
    stoppingThreshold,
  );

  const createSeries = () => {
    if (!analytics?.lines?.length) return [];

    const seriesData = [];
    if (analytics.lines.length > 1) {
      analytics.lines.slice(0, -1).forEach((line) => {
        seriesData.push({
          name: "Distance",
          data: line,
          dashArray: 0,
        });
      });
    }
    const lastLine = analytics.lines[analytics.lines.length - 1];

    if (lastLine) {
      seriesData.push({
        name: "Distance",
        data: lastLine,
        dashArray: currentLine.length === 0 ? 5 : 0,
      });
    }
    if (currentLine.length) {
      seriesData.push({
        name: "Current",
        data: currentLine,
        dashArray: 5,
      });
    }
    return seriesData;
  };

  const series = createSeries();
  const chartOptions = {
    chart: {
      type: "line",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    stroke: {
      curve: "straight",
      width: 3,
      lineCap: "butt",
      dashArray: series.map((s) => s.dashArray),
    },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    colors: [theme.palette.primary.main, theme.palette.primary.main],
    xaxis: {
      type: "numeric",
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: "Records Reviewed",
        style: { color: theme.palette.text.secondary },
      },
      min: 0,
      max: Math.max(currentPosition, lastRelevant) + 10,
    },
    yaxis: {
      min: 0,
      max: Math.ceil(maxY * 1.2),
      title: {
        text: "Not Relevant Records Between Relevant Records",
        style: { color: theme.palette.text.secondary },
      },
      labels: {
        formatter: (val) => Math.round(val),
        style: { colors: theme.palette.text.secondary },
      },
      forceNiceScale: true,
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "14px",
      fontFamily: theme.typography.subtitle2.fontFamily,
      fontWeight: theme.typography.subtitle2.fontWeight,
      labels: {
        colors: theme.palette.text.secondary,
      },
      customLegendItems: ["Relevant Records", "Distance Between Records"],
      markers: {
        width: 8,
        height: 8,
        radius: 50,
        fillColors: [theme.palette.grey[600], theme.palette.primary.main],
        strokeWidth: 0,
        offsetX: -4,
      },
      itemMargin: {
        horizontal: 16,
      },
    },
    annotations: {
      yaxis: stoppingThreshold
        ? [
            {
              y: stoppingThreshold,
              borderColor: theme.palette.primary.main,
              borderWidth: 1.5,
              label: {
                borderColor: "transparent",
                borderWidth: 0,
                style: {
                  color: theme.palette.primary.main,
                  background: "none",
                  fontWeight: "bold",
                },
                text: "Stopping Threshold",
                position: "left",
                offsetX: 110,
              },
            },
          ]
        : [],
      points: [
        ...(analytics?.relevantPositions?.map((position) => ({
          x: position,
          y: 0,
          marker: {
            size: 3,
            fillColor: theme.palette.grey[600],
            strokeColor: theme.palette.grey[600],
            radius: 2,
          },
        })) || []),
        currentPosition > 0
          ? {
              x: currentPosition,
              y: 0,
              marker: {
                size: 5,
                fillColor: theme.palette.background.paper,
                strokeColor: theme.palette.grey[600],
                strokeWidth: 2,
                strokeDashArray: 5,
                radius: 2,
              },
            }
          : null,
      ].filter(Boolean),
    },
    tooltip: {
      enabled: false,
    },
    markers: {
      size: 0,
      hover: { size: 0 },
      showNullDataPoints: false,
    },
    dataLabels: {
      enabled: false,
    },
    noData: {
      text: "No data available",
    },
  };

  const createMockData = () => {
    const positions = [5, 10, 25, 50];
    const lines = [];

    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      const distance = end - start;
      lines.push([
        { x: start, y: distance },
        { x: end, y: distance },
      ]);
    }

    return lines.slice(0, 3).map((line) => ({
      data: line,
    }));
  };

  const exampleChartOptions = {
    chart: {
      type: "line",
      background: "transparent",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    stroke: {
      curve: "straight",
      width: 3,
      lineCap: "butt",
    },
    grid: {
      show: false,
    },
    colors: [theme.palette.primary.main],
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      min: 0,
      max: 60,
    },
    yaxis: {
      labels: { show: false },
      min: 0,
      max: 30,
    },
    annotations: {
      points: [5, 10, 25, 50].map((position) => ({
        x: position,
        y: 0,
        marker: {
          size: 3,
          fillColor: theme.palette.grey[600],
          strokeColor: theme.palette.grey[600],
          radius: 2,
        },
      })),
    },
    legend: { show: false, showMarkersList: false },
    tooltip: { enabled: false },
    markers: {
      size: 0,
      hover: { size: 0 },
      legendInactiveClass: "hide",
    },
  };

  const exampleSeries = createMockData();

  return (
    <Card sx={{ position: "relative", backgroundColor: "transparent", mt: 2 }}>
      <CardContent sx={{ mt: 1 }}>
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>

        <CardErrorHandler
          queryKey="fetchGenericData and fetchProgress"
          error={genericDataQuery?.error || progressQuery?.error}
          isError={!!genericDataQuery?.isError || !!progressQuery?.isError}
        />

        {genericDataQuery?.isLoading || progressQuery?.isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : analytics ? (
          <Chart
            options={chartOptions}
            series={series}
            type="line"
            height={400}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Start screening to see distance patterns
          </Typography>
        )}
      </CardContent>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Relevant Frequency
              </Typography>
              <Typography variant="body2">
                This visualization shows how far apart your relevant findings
                are from each other. The blue dots represent relevant records,
                and the height of the lines shows how many not relevant records
                you reviewed in between.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Dashed Line
                  </Typography>
                  <Typography variant="body2">
                    The dashed line shows the distance between your current
                    labeling and the last relevant record.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Short Distances
                  </Typography>
                  <Typography variant="body2">
                    Finding relevant records close together suggests you're in a
                    productive area.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Growing Distances
                  </Typography>
                  <Typography variant="body2">
                    When distances between relevant findings get close to your
                    stopping threshold, you might be reaching the end of your
                    relevant records.
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Example Visualization
              </Typography>
              <Box display="flex" justifyContent="center">
                <Chart
                  options={exampleChartOptions}
                  series={exampleSeries}
                  type="line"
                  height={120}
                  width={280}
                />
              </Box>
            </Box>
            <Button
              href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: "none", p: 0 }}
            >
              Learn more →
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Card>
  );
};

export default DistancePatternChart;
