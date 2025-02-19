import React, { useState, useRef } from "react";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  Popover,
  Divider,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { CardErrorHandler } from "Components";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { LineChart, legendClasses } from "@mui/x-charts";

const calculateProgressDensity = (data) => {
  return data.map((entry, index, arr) => {
    const window = arr.slice(Math.max(0, index - 9), index + 1);
    const mean =
      window.reduce((acc, curr) => acc + curr.label, 0) / window.length;
    let relevant;
    if (index + 1 < 10) {
      relevant = mean * (index + 1);
    } else {
      relevant = mean * 10;
    }
    return { x: index + 1, y: Math.round(relevant * 10) / 10 };
  });
};

export default function ProgressDensityChart(props) {
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
    if (!props.genericDataQuery.data) return null;

    const formattedData = calculateProgressDensity(props.genericDataQuery.data);

    return {
      xAxis: formattedData.map((item) => item.x),
      series: [
        {
          data: formattedData.map((item) => item.y),
          label: "Relevant records",
          color:
            theme.palette.mode === "light"
              ? theme.palette.tertiary.dark
              : theme.palette.tertiary.dark,
          area: true,
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
        d="M5,50
           Q15,20 25,10
           Q35,0 45,40
           Q55,20 65,30
           Q75,50 85,50
           L95,50"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  const badScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <path
        d="M5,50 C20,45 40,40 60,42 80,43 90,45 95,50"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  return (
    <Card sx={{ backgroundColor: "transparent" }}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={props.genericDataQuery?.error}
        isError={!!props.genericDataQuery?.isError}
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
              aria-owns={popoverOpen ? "info-popover" : undefined}
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
                series={[
                  {
                    ...chartData.series[0],
                    area: true,
                    type: "line",
                  },
                ]}
                xAxis={[
                  {
                    data: chartData.xAxis,
                    label: "Records Reviewed",
                    tickMinStep: 1,
                  },
                ]}
                yAxis={[
                  {
                    label: "Relevant Records per 10 Records",
                    min: 0,
                    max: 10,
                    tickAmount: 5,
                  },
                ]}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "top", horizontal: "left" },
                    padding: { top: -10 },
                    labelStyle: {
                      fill: theme.palette.text.secondary,
                    },
                  },
                }}
                sx={{
                  ".MuiAreaElement-root": {
                    fillOpacity: 0.2,
                  },
                  ".MuiChartsLegend-root": {
                    transform: "translate(24px, 8px)",
                  },
                  ".MuiLineElement-root": {
                    strokeWidth: 2,
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
            borderRadius: 3,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Progress Density
              </Typography>
              <Typography variant="body2">
                This chart shows how many relevant records are found per 10
                documents. Initially, you might find many relevant records, but
                as you proceed, relevancy often tapers off.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Comparing Examples
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Good:</strong> {""} Most relevant records are
                    discovered early in the review process, followed by a
                    natural decline in new findings.
                  </Typography>
                  {goodScenarioSVG}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Bad:</strong> {""} Few relevant records are found
                    throughout the review process. This may indicate potential
                    issues.
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
