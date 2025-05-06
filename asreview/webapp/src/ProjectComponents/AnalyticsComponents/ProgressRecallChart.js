import React, { useState, useRef } from "react";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Popover,
  Menu,
  Typography,
  Stack,
  Skeleton,
  Divider,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { CardErrorHandler } from "Components";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { LineChart, legendClasses } from "@mui/x-charts";

const calculateProgressRecall = (data, progress) => {
  const totalInclusions = data.reduce((acc, curr) => acc + curr.label, 0);

  return data.map((entry, index, arr) => {
    const cumulativeLabel = arr
      .slice(0, index + 1)
      .reduce((acc, curr) => acc + curr.label, 0);

    const expectedRandom = Math.round(
      (index + 1) * (totalInclusions / progress?.n_records_no_priors),
    );

    return {
      x: index + 1,
      asreview: cumulativeLabel,
      random: expectedRandom,
    };
  });
};

export default function ProgressRecallChart({
  genericDataQuery,
  progressRecallQuery,
  progressQuery,
}) {
  const theme = useTheme();
  const chartRef = useRef(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
  const [anchorElMenu, setAnchorElMenu] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorPosition({
      top: event.clientY + 10,
      left: event.clientX - 50,
    });
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
  };

  const handleDownloadClick = (event) => {
    setAnchorElMenu(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleDownload = (format) => {
    setAnchorElMenu(null);

    const node = chartRef.current;
    const downloadFileName = `chart.${format}`;

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

  const processChartData = () => {
    if (!genericDataQuery.data) return null;

    const calculatedData = calculateProgressRecall(
      genericDataQuery.data,
      progressQuery.data,
    );

    return {
      xAxis: calculatedData.map((item) => item.x),
      series: [
        {
          data: calculatedData.map((item) => item.asreview),
          label: "Relevant by ASReview LAB",
          color: theme.palette.tertiary.dark,
          showMark: false,
          curve: "linear",
        },
        {
          data: calculatedData.map((item) => item.random),
          label: "Random Relevant",
          color: theme.palette.grey[600],
          showMark: false,
          curve: "linear",
        },
      ],
    };
  };

  const chartData = processChartData();

  const goodScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <polyline
        points="5,55 10,25 15,15 20,8 25,8 30,8 35,8 40,8 45,8 50,8 55,8 60,8 65,8 70,8 75,8 80,8 85,8 90,8 95,8"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="1"
        fill="none"
      />
      <polyline
        points="5,55 10,53 15,51 20,49 25,47 30,45 35,43 40,41 45,39 50,37 55,35 60,33 65,31 70,29 75,27 80,25 85,23 90,21 95,19"
        stroke={theme.palette.grey[600]}
        strokeWidth="1"
        fill="none"
        strokeDasharray="2"
      />
    </svg>
  );

  const badScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <polyline
        points="5,55 10,52 15,50 20,47 25,45 30,42 35,40 40,38 45,36 50,34 55,32 60,30 65,28 70,26 75,24 80,22 85,20 90,18 95,16"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="1"
        fill="none"
      />
      <polyline
        points="5,55 10,53 15,51 20,49 25,47 30,45 35,43 40,41 45,39 50,37 55,35 60,33 65,31 70,29 75,27 80,25 85,23 90,21 95,19"
        stroke={theme.palette.grey[600]}
        strokeWidth="1"
        fill="none"
        strokeDasharray="2"
      />
    </svg>
  );

  return (
    <Card sx={{ bgcolor: "transparent", position: "relative", mt: 2 }}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={progressRecallQuery?.error}
        isError={!!progressRecallQuery?.isError}
      />
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
            onClick={handlePopoverOpen}
            aria-owns={popoverOpen ? "mouse-over-popover" : undefined}
            aria-haspopup="true"
          >
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>

        <Box height={400} width={1} ref={chartRef} sx={{ mt: -3 }}>
          {genericDataQuery.isLoading ? (
            <Skeleton variant="rectangular" height="100%" width="100%" />
          ) : chartData && chartData.xAxis.length > 1 ? (
            <LineChart
              margin={{ left: 60, top: 70 }}
              height={400}
              series={chartData.series}
              xAxis={[
                {
                  data: chartData.xAxis,
                  label: "Records Reviewed",
                  tickMinStep: 1,
                },
              ]}
              yAxis={[
                {
                  label: "Relevant Records",
                  tickMinStep: 1,
                },
              ]}
              slotProps={{
                legend: {
                  direction: "row",
                  position: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  itemGap: 30,
                  padding: { top: 0, bottom: 15 },
                  labelStyle: {
                    fill: theme.palette.text.secondary,
                    fontSize: "0.8rem",
                  },
                },
              }}
              sx={{
                ".MuiLineElement-root": {
                  strokeWidth: 2,
                },
                [`& .${legendClasses.mark}`]: {
                  ry: 10,
                },
                "& .MuiChartsAxis-left .MuiChartsAxis-label": {
                  transform: "translateX(-10px)",
                },
                height: "100%",
                width: "100%",
              }}
            />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Alert severity="info">
                Keep screening records to display the chart
              </Alert>
            </Box>
          )}
        </Box>
      </CardContent>

      <Popover
        open={popoverOpen}
        onClose={handlePopoverClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Progress Recall
              </Typography>
              <Typography variant="body2" align="justify">
                This chart compares the model's ability to find relevant records
                early against a random approach. A good model quickly identifies
                a large portion of relevant records, while random grows more
                slowly.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                align="justify"
                sx={{ mb: 1 }}
              >
                Comparing Examples
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" align="justify" sx={{ mb: 1 }}>
                    <strong>Good:</strong> {""}
                    The model's performance curve rises steeply early in the
                    process, significantly outperforming random selection.
                  </Typography>
                  {goodScenarioSVG}
                </Box>
                <Box>
                  <Typography variant="body2" align="justify" sx={{ mb: 1 }}>
                    <strong>Bad:</strong> {""}
                    The model's performance curve stays close to random
                    selection, indicating limited effectiveness in identifying
                    relevant records.
                  </Typography>
                  {badScenarioSVG}
                </Box>
              </Stack>
            </Box>
            <Box>
              <Button
                href="https://asreview.readthedocs.io/en/latest/progress.html#analytics"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </Button>
            </Box>
          </Stack>
        </Box>
      </Popover>
    </Card>
  );
}
