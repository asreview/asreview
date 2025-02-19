import React, { useState, useRef } from "react";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { CardErrorHandler } from "Components";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { LineChart, legendClasses } from "@mui/x-charts";

const calculateProgressRecall = (data) => {
  const totalInclusions = data.reduce((acc, curr) => acc + curr.label, 0);
  const totalRecords = data.length;

  return data.map((entry, index, arr) => {
    const cumulativeLabel = arr
      .slice(0, index + 1)
      .reduce((acc, curr) => acc + curr.label, 0);

    const expectedRandom = Math.round(
      (index + 1) * (totalInclusions / totalRecords),
    );

    return {
      x: index + 1,
      asreview: cumulativeLabel,
      random: expectedRandom,
    };
  });
};

export default function ProgressRecallChart(props) {
  const theme = useTheme();
  const mobileScreen = useMediaQuery(theme.breakpoints.down("md"), {
    noSsr: true,
  });
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
    if (!props.genericDataQuery.data) return null;

    const calculatedData = calculateProgressRecall(props.genericDataQuery.data);

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
      <path
        d="M5,55 Q10,10 15,8 T95,5"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M5,55 C25,45 50,35 75,25 95,20 95,20 95,20"
        stroke={theme.palette.grey[600]}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  const badScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <path
        d="M5,55 C25,50 50,40 75,35 90,30 95,28 95,27"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M5,55 C25,52 50,45 75,40 90,35 95,33 95,32"
        stroke={theme.palette.grey[600]}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  return (
    <Card sx={{ bgcolor: "transparent" }}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={props.progressRecallQuery?.error}
        isError={!!props.progressRecallQuery?.isError}
      />
      <CardContent>
        <Stack>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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

          <Box ref={chartRef}>
            {props.genericDataQuery.isLoading ? (
              <Skeleton variant="rectangular" height={400} width="100%" />
            ) : chartData ? (
              <LineChart
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
                    direction: mobileScreen ? "column" : "row",
                    position: { vertical: "top", horizontal: "left" },
                    padding: { top: -10 },
                    labelStyle: {
                      fill: theme.palette.text.secondary,
                    },
                  },
                }}
                sx={{
                  ".MuiLineElement-root": {
                    strokeWidth: 2,
                  },
                  ".MuiChartsLegend-root": {
                    transform: "translate(24px, 8px)",
                  },
                  [`& .${legendClasses.mark}`]: {
                    ry: 10,
                  },
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No data available
              </Typography>
            )}
          </Box>
        </Stack>
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
              <Typography variant="body2" sx={{ textAlign: "justify" }}>
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
                sx={{ mb: 1, textAlign: "justify" }}
              >
                Comparing Examples
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, textAlign: "justify" }}
                  >
                    <strong>Good:</strong> {""}
                    The model's performance curve rises steeply early in the
                    process, significantly outperforming random selection.
                  </Typography>
                  {goodScenarioSVG}
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, textAlign: "justify" }}
                  >
                    <strong>Bad:</strong> {""}
                    The model's performance curve stays close to random
                    selection, indicating limited effectiveness in identifying
                    relevant records.
                  </Typography>
                  {badScenarioSVG}
                </Box>
              </Stack>
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
}
