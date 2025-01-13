import React, { useRef, useState, useEffect, useCallback } from "react";
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
import GetAppIcon from "@mui/icons-material/GetApp";
import { toPng, toJpeg, toSvg } from "html-to-image";
import Chart from "react-apexcharts";

import { CardErrorHandler } from "Components";

import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const calculateProgressDensity = (data) => {
  return data.map((entry, index, arr) => {
    // Create a rolling window of up to 10 entries
    const window = arr.slice(Math.max(0, index - 9), index + 1);

    // Calculate the mean of the 'label' over the window
    const mean =
      window.reduce((acc, curr) => acc + curr.label, 0) / window.length;

    // Calculate the relevant counts
    let relevant;
    if (index + 1 < 10) {
      // For the first 9 items, scale to the number of items in the window
      relevant = mean * (index + 1);
    } else {
      // After 10 items, scale to 10
      relevant = mean * 10;
    }

    // Round to 1 decimal place to match the backend behavior
    return {
      x: index + 1,
      y: Math.round(relevant * 10) / 10,
    };
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

    const node = chartRef.current.querySelector(".apexcharts-canvas");
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
        toJpeg(node, {
          quality: 1,
          bgcolor: theme.palette.background.paper,
        })
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

  const seriesArray = useCallback(() => {
    if (props.genericDataQuery.data) {
      return [
        {
          name: "Relevant records",
          data: calculateProgressDensity(props.genericDataQuery.data),
        },
      ];
    } else {
      return [];
    }
  }, [props.genericDataQuery.data]);

  const optionsChart = useCallback(() => {
    return {
      chart: {
        animations: {
          enabled: false,
        },
        background: "transparent",
        id: "ASReviewLABprogressDensity",
        type: "area",
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      colors: [
        theme.palette.mode === "light"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
        theme.palette.grey[600],
      ],
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: theme.palette.mode === "light" ? 0.9 : 0.2,
          opacityFrom: 0.5,
          opacityTo: 0.9,
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        fontSize: "14px",
        fontFamily: theme.typography.subtitle2.fontFamily,
        fontWeight: theme.typography.subtitle2.fontWeight,
        labels: {
          colors: theme.palette.text.secondary,
        },
        markers: {
          width: 8,
          height: 8,
          offsetX: -4,
        },
        itemMargin: {
          horizontal: 16,
        },
      },
      markers: {
        size: 0,
      },
      noData: {
        text: "No data available",
      },
      stroke: {
        curve: "smooth",
        lineCap: "round",
        width: 2,
      },
      theme: {
        mode: theme.palette.mode,
      },
      tooltip: {},
      xaxis: {
        decimalsInFloat: 0,
        title: {
          text: "Records Reviewed",
        },
        type: "numeric",
        labels: {
          show: true,
        },
        axisTicks: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        showAlways: false,
        max: 10,
        min: 0,
        tickAmount: 5,
        title: {
          text: "Relevant Records per 10 Records",
        },
      },
    };
  }, [theme]);

  const [series, setSeries] = useState(seriesArray());
  const [options, setOptions] = useState(optionsChart());

  useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  // Inline SVG for a "mountain" scenario: starts high, forms a couple of peaks,
  const goodScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <path
        d="M5,50
           Q15,20 25,10
           Q35,0 45,40
           Q55,20 65,30
           Q75,50 85,50
           L95,50"
        stroke={theme.palette.primary.main}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  // Inline SVG for bad scenario: never takes off, stays low
  const badScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      {" "}
      {/* A line starting near bottom-left and staying low to bottom-right */}
      <path
        d="M5,50 C20,45 40,40 60,42 80,43 90,45 95,50"
        stroke={theme.palette.primary.main}
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0 }}>
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
          {props.genericDataQuery.isLoading ? (
            <Skeleton variant="rectangular" height={400} width="100%" />
          ) : (
            <div ref={chartRef}>
              <Chart
                options={options}
                series={series}
                type="area"
                height={400}
                width="100%"
              />
            </div>
          )}
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
