import React, { useRef, useState, useEffect, useCallback } from "react";
import { HelpOutline } from "@mui/icons-material";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toPng, toJpeg, toSvg } from "html-to-image";

import { CardErrorHandler } from "Components";
import Chart from "react-apexcharts";

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

  const [anchorElPopover, setAnchorElPopover] = useState(null);
  const [anchorElMenu, setAnchorElMenu] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorElPopover(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorElPopover(null);
  };

  const popoverOpen = Boolean(anchorElPopover);

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

  /**
   * Chart options
   */
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
      colors: [lightModePrimaryColor(), darkBlueColor()],
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
  }, [theme, lightModePrimaryColor, darkBlueColor, maxY]);

  const [series, setSeries] = useState(seriesArray());
  const [options, setOptions] = useState(optionsChart());

  useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <Card>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={props.progressRecallQuery?.error}
        isError={!!props.progressRecallQuery?.isError}
      />
      <CardContent>
        <Stack>
          <Box>
            <IconButton onClick={handleDownloadClick}>
              <GetAppIcon />
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
              onClick={handlePopoverOpen}
              aria-owns={popoverOpen ? "mouse-over-popover" : undefined}
              aria-haspopup="true"
            >
              <HelpOutline fontSize={!props.mobileScreen ? "small" : "12px"} />
            </IconButton>
            <Popover
              id="mouse-over-popover"
              open={popoverOpen}
              anchorEl={anchorElPopover}
              onClose={handlePopoverClose}
            >
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Progress Recall Chart</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  The chart shows how well the ASReview model and random
                  sampling identify relevant records.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  The model helps prioritize relevant records, but not all
                  relevant records will be identified by the model.
                </Typography>
                <Typography variant="body2" gutterBottom>
                  The random relevant line shows the performance if you manually
                  reviewed all records without model assistance.
                </Typography>
              </Box>
            </Popover>
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
    </Card>
  );
}
