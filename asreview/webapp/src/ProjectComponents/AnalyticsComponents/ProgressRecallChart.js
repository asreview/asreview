import React, { useRef, useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { CardErrorHandler } from "Components";
import Chart from "react-apexcharts";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";

const calculateProgressRecall = (data) => {
  // Total number of relevant items (inclusions)
  const totalInclusions = data.reduce((acc, curr) => acc + curr.label, 0);
  const totalRecords = data.length;

  return data.map((entry, index, arr) => {
    // Cumulative sum of relevant items up to the current index
    const cumulativeLabel = arr
      .slice(0, index + 1)
      .reduce((acc, curr) => acc + curr.label, 0);

    // Calculate the expected random inclusions
    const expectedRandom = Math.round(
      (index + 1) * (totalInclusions / totalRecords),
    );

    // Return the results with the same structure as the backend
    return {
      x: index + 1,
      asreview: cumulativeLabel,
      random: expectedRandom,
    };
  });
};

export default function ProgressRecallChart(props) {
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

  const lightModePrimaryColor = useCallback(() => {
    return theme.palette.mode === "light"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  }, [theme.palette.mode, theme.palette.primary]);

  const darkBlueColor = useCallback(() => {
    return theme.palette.grey[600];
  }, [theme.palette.grey]);

  const seriesArray = useCallback(() => {
    if (props.genericDataQuery.data) {
      const calculatedData = calculateProgressRecall(
        props.genericDataQuery.data,
      );
      return [
        {
          name: "Relevant by ASReview LAB",
          data: calculatedData.map((item) => ({
            x: item.x,
            y: item.asreview,
          })),
        },
        {
          name: "Random Relevant",
          data: calculatedData.map((item) => ({
            x: item.x,
            y: item.random,
          })),
        },
      ];
    } else {
      return [];
    }
  }, [props.genericDataQuery.data]);

  const maxY = useCallback(() => {
    if (seriesArray()[0]?.data !== undefined) {
      return Math.max.apply(
        Math,
        seriesArray()[0]?.data.map((element) => {
          return element.y;
        }),
      );
    } else {
      return undefined;
    }
  }, [seriesArray]);

  const optionsChart = useCallback(() => {
    const maxYValue = maxY() || 0;
    const tickAmount = 7;
    const closestDivisibleBy7 = Math.ceil(maxYValue / tickAmount) * tickAmount; // To make the intervals consistent, max value in the y-axis should be always divisible by 7.

    return {
      chart: {
        animations: {
          enabled: false,
        },
        background: "transparent",
        id: "ASReviewLABprogressRecall",
        type: "line",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: [darkBlueColor(), lightModePrimaryColor()],
      dataLabels: {
        enabled: false,
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
        labels: {
          show: true,
        },
        title: {
          text: "Records Reviewed",
        },
        type: "numeric",
        axisTicks: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val !== null && val !== undefined ? val.toFixed() : "";
          },
        },
        showAlways: false,
        max: closestDivisibleBy7,
        forceNiceScale: false,
        min: 0,
        tickAmount: tickAmount,
        title: {
          text: "Relevant Records",
        },
      },
    };
  }, [theme, darkBlueColor, lightModePrimaryColor, maxY]);

  const [series, setSeries] = useState(seriesArray());
  const [options, setOptions] = useState(optionsChart());

  useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  // Inline SVGs for Recall Examples

  // Good scenario: a steep initial rise then flattening near top.
  const goodScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <path
        d="M5,55 Q10,10 15,8 T95,5"
        stroke={darkBlueColor()}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M5,55 C25,45 50,35 75,25 95,20 95,20 95,20"
        stroke={lightModePrimaryColor()}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  // Bad scenario: model barely outperforms random, both lines rise similarly
  const badScenarioSVG = (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <path
        d="M5,55 C25,50 50,40 75,35 90,30 95,28 95,27"
        stroke={darkBlueColor()}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M5,55 C25,52 50,45 75,40 90,35 95,33 95,32"
        stroke={lightModePrimaryColor()}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  return (
    <Card sx={{ backgroundColor: "transparent" }}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={props.progressRecallQuery?.error}
        isError={!!props.progressRecallQuery?.isError}
      />
      <CardContent>
        <Stack>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -2 }}>
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
          {props.genericDataQuery.isLoading ? (
            <Skeleton variant="rectangular" height={400} width="100%" />
          ) : (
            <div ref={chartRef}>
              <Chart
                options={options}
                series={series}
                type="line"
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
            borderRadius: 2,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Progress Recall
              </Typography>
              <Typography variant="body2">
                This chart compares the model's ability to find relevant records
                early against a random approach. A good model quickly identifies
                a large portion of relevant records, while random grows more
                slowly.
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
                    <strong>Good:</strong> {""}
                    The model's performance curve rises steeply early in the
                    process, significantly outperforming random selection.
                  </Typography>
                  {goodScenarioSVG}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
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
