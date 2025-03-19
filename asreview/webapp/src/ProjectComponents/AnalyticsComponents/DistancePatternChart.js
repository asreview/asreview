import GetAppIcon from "@mui/icons-material/GetApp";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { LineChart, legendClasses } from "@mui/x-charts";
import { ProjectAPI } from "api";
import { CardErrorHandler } from "Components";
import { toJpeg, toPng, toSvg } from "html-to-image";
import React from "react";
import { useQuery } from "react-query";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const DistancePatternChart = ({ project_id, showLast = false }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElMenu, setAnchorElMenu] = React.useState(null);
  const chartRef = React.useRef(null);
  const theme = useTheme();

  const { data, error, isError, isLoading } = useQuery(
    ["fetchGenericData", { project_id }],
    ProjectAPI.fetchGenericData,
    { refetchOnWindowFocus: false },
  );

  const { data: stoppingData } = useQuery(
    ["fetchStopping", { project_id }],
    ProjectAPI.fetchStopping,
    { refetchOnWindowFocus: false },
  );

  const relevantPositions = data
    ? data.reduce(
        (acc, item, i) => (item.label === 1 ? [...acc, i + 1] : acc),
        [],
      )
    : [];

  const distancePos = relevantPositions
    .map((position, index) =>
      index === 0
        ? [0, position - 1]
        : [relevantPositions[index - 1], position - 1],
    )
    .flat();
  const distance = relevantPositions
    .map((position, index) =>
      index === 0
        ? [0, position - 1]
        : [0, position - relevantPositions[index - 1] - 1],
    )
    .flat();

  // the last part of the chart
  if (showLast) {
    distance.push(0, data.length - relevantPositions.slice(-1)[0]);
    distancePos.push(relevantPositions.slice(-1)[0], data.length);
  } else {
    if (relevantPositions.slice(-1)[0] !== data.length) {
      distance.push(0);
      distancePos.push(relevantPositions.slice(-1)[0]);
    }
  }

  // make a stop line at the stopping threshold
  const stopLine = [
    stoppingData?.params?.n,
    ...Array(distancePos.length - 2).fill(null),
    stoppingData?.params?.n,
  ];

  const handleDownloadClick = (event) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleDownload = (format) => {
    setAnchorElMenu(null);

    const node = chartRef.current;
    const downloadFileName = `distance-pattern-chart.${format}`;

    switch (format) {
      case "png":
        toPng(node)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = downloadFileName;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("oops, something went wrong!", error);
          });
        break;
      case "jpeg":
        toJpeg(node, { quality: 1, bgcolor: theme.palette.background.paper })
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = downloadFileName;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("oops, something went wrong!", error);
          });
        break;
      case "svg":
        toSvg(node)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = downloadFileName;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("oops, something went wrong!", error);
          });
        break;
      default:
        break;
    }
  };

  return (
    <Card sx={{ position: "relative", backgroundColor: "transparent", mt: 2 }}>
      <CardContent sx={{ mt: 1 }}>
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            display: "flex",
          }}
        >
          <IconButton onClick={handleDownloadClick}>
            <GetAppIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorElMenu}
            open={Boolean(anchorElMenu)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleDownload("png")}>
              Download as PNG
            </MenuItem>
            <MenuItem onClick={() => handleDownload("jpeg")}>
              Download as JPEG
            </MenuItem>
            <MenuItem onClick={() => handleDownload("svg")}>
              Download as SVG
            </MenuItem>
          </Menu>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <StyledLightBulb fontSize="small" />
          </IconButton>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            sx={{
              borderRadius: 3,
              maxWidth: 320,
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    align="justify"
                    sx={{ mb: 1 }}
                  >
                    Wave of not relevant records
                  </Typography>
                  <Typography variant="body2" align="justify">
                    This visualization shows how far apart your relevant
                    findings are from each other. The height of the "wave" shows
                    how many not relevant records you reviewed in between the
                    relevant records. If the wave exceeds the stopping
                    threshold, you might be reaching the end of your relevant
                    records.
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ mb: 1, textAlign: "justify" }}
                      >
                        Small "Waves"
                      </Typography>
                      <Typography variant="body2" align="justify">
                        Finding relevant records close together suggests you're
                        in a productive area.
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ mb: 1, textAlign: "justify" }}
                      >
                        Big "Waves"
                      </Typography>
                      <Typography variant="body2" align="justify">
                        When distances between relevant findings get close to
                        your stopping threshold, you might be reaching the end
                        of your relevant records.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Divider />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1, textAlign: "justify" }}
                  >
                    Example Visualization
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="center"
                    height={200}
                    width={280}
                  >
                    <LineChart
                      series={[
                        {
                          data: [0, 3, 0, 0, 4, 0, 0, 7, 0, 19],
                          color: theme.palette.grey[600],
                        },
                        {
                          data: [
                            15,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            null,
                            15,
                          ],
                          color: theme.palette.error.main,
                          connectNulls: true,
                        },
                      ]}
                      xAxis={[
                        {
                          data: [1, 3, 4, 5, 9, 10, 11, 18, 19, 30],
                          min: 1,
                          tickMinStep: 1,
                        },
                      ]}
                      yAxis={[{}]}
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
        </Box>

        <CardErrorHandler
          queryKey="fetchGenericData and fetchProgress"
          error={error}
          isError={!!isError}
        />

        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : data ? (
          <Box height={400} width={1} ref={chartRef} sx={{ mt: -3 }}>
            <LineChart
              margin={{ left: 60, top: 70 }}
              height={400}
              series={[
                {
                  data: distance,
                  label: "Distance Between Records",
                  color: theme.palette.grey[600],
                },
                {
                  data: stopLine,
                  connectNulls: true,
                  label: "Stopping Threshold",
                  color: theme.palette.error.main,
                },
              ]}
              xAxis={[
                {
                  data: distancePos,
                  // min: 1,
                  tickMinStep: 1,
                  label: "Records Reviewed",
                },
              ]}
              yAxis={[
                {
                  tickMinStep: 1,
                  label: "Not Relevant Records Between Relevant Records",
                },
              ]}
              slotProps={{
                legend: {
                  position: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  direction: "column",
                  itemGap: 10,
                  padding: { top: 0, bottom: 15 },
                  labelStyle: {
                    fill: theme.palette.text.secondary,
                    fontSize: "0.8rem",
                  },
                },
              }}
              sx={{
                [`& .${legendClasses.mark}`]: {
                  ry: 10,
                },
                "& .MuiChartsAxis-left .MuiChartsAxis-label": {
                  transform: "translateX(-10px)",
                },
                ".MuiChartsLegend-root": {
                  transform: "translate(24px, 0px)",
                },
                height: "100%",
                width: "100%",
              }}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Start screening to see distance patterns
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DistancePatternChart;
