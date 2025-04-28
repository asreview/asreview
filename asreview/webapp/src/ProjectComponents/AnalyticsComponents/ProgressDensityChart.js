import React, { useState, useRef } from "react";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
  Alert,
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
          label: "Relevant Records",
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
      <polyline
        points="5,55
                7,30 13,30
                15,15 18,15
                20,5 23,5
                25,25 28,25
                30,10 33,10
                35,25 38,25
                40,35 43,35
                45,30 48,30
                50,40 53,40
                55,35 58,35
                60,45 63,45
                65,55 95,55"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M5,55
          7,30 13,30
          15,15 18,15
          20,5 23,5
          25,25 28,25
          30,10 33,10
          35,25 38,25
          40,35 43,35
          45,30 48,30
          50,40 53,40
          55,35 58,35
          60,45 63,45
          65,55 95,55 Z"
        fill={theme.palette.tertiary.dark}
        fillOpacity="0.1"
        stroke="none"
      />
      <line
        x1="5"
        y1="55"
        x2="95"
        y2="55"
        stroke={theme.palette.grey[400]}
        strokeWidth="0.5"
        strokeDasharray="2"
      />
      <line
        x1="5"
        y1="5"
        x2="95"
        y2="5"
        stroke={theme.palette.grey[400]}
        strokeWidth="0.5"
        strokeDasharray="2"
      />
    </svg>
  );

  const badScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <polyline
        points="5,55
                8,45 12,45
                15,48 18,48
                20,50 22,50
                25,45 28,45
                30,50 33,50
                35,52 38,52
                40,55 95,55"
        stroke={theme.palette.tertiary.dark}
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M5,55
          8,45 12,45
          15,48 18,48
          20,50 22,50
          25,45 28,45
          30,50 33,50
          35,52 38,52
          40,55 95,55 Z"
        fill={theme.palette.tertiary.dark}
        fillOpacity="0.1"
        stroke="none"
      />
      <line
        x1="5"
        y1="55"
        x2="95"
        y2="55"
        stroke={theme.palette.grey[400]}
        strokeWidth="0.5"
        strokeDasharray="2"
      />
      <line
        x1="5"
        y1="5"
        x2="95"
        y2="5"
        stroke={theme.palette.grey[400]}
        strokeWidth="0.5"
        strokeDasharray="2"
      />
    </svg>
  );

  return (
    <Card sx={{ backgroundColor: "transparent", position: "relative", mt: 2 }}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={props.genericDataQuery?.error}
        isError={!!props.genericDataQuery?.isError}
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
            aria-owns={popoverOpen ? "info-popover" : undefined}
            aria-haspopup="true"
          >
            <StyledLightBulb fontSize="small" />
          </IconButton>
        </Box>

        <Box height={400} width={1} ref={chartRef} sx={{ mt: -3 }}>
          {props.genericDataQuery.isLoading ? (
            <Skeleton variant="rectangular" height="100%" width="100%" />
          ) : chartData && chartData.xAxis.length > 1 ? (
            <LineChart
              margin={{ left: 60 }}
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
                  position: { vertical: "top", horizontal: "left" },
                  direction: "row",
                  itemGap: 20,
                  padding: { top: 5 },
                  labelStyle: {
                    fill: theme.palette.text.secondary,
                    fontSize: "0.8rem",
                  },
                },
              }}
              sx={{
                ".MuiAreaElement-root": {
                  fillOpacity: 0.2,
                },
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
              <Typography variant="body2" align="justify">
                This chart shows how many relevant records are found per 10
                documents. Initially, you might find many relevant records, but
                as you proceed, relevancy often tapers off.
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
                    <strong>Good:</strong> {""} Most relevant records are
                    discovered early in the review process, followed by a
                    natural decline in new findings.
                  </Typography>
                  {goodScenarioSVG}
                </Box>
                <Box>
                  <Typography variant="body2" align="justify" sx={{ mb: 1 }}>
                    <strong>Bad:</strong> {""} Few relevant records are found
                    throughout the review process. This may indicate potential
                    issues.
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
