import React, { useRef, useState, useEffect, useCallback } from "react";
import Chart from "react-apexcharts";
import {
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  tooltipClasses,
  Box,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import GetAppIcon from "@mui/icons-material/GetApp";
import { HelpOutline } from "@mui/icons-material";
import { toPng, toJpeg, toSvg } from "html-to-image";

import { CardErrorHandler } from "Components";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

const PREFIX = "ProgressRecallChart";

const classes = {
  root: `${PREFIX}-root`,
  tooltipCardColor: `${PREFIX}-tooltip-card-color`,
  tooltipLabelContainer: `${PREFIX}-tooltip-label-container`,
  tooltipLabelMarkerASReviewColor: `${PREFIX}-tooltip-label-marker-asreview-color`,
  tooltipLabelMarkerRandomColor: `${PREFIX}-tooltip-label-marker-random-color`,
  tooltipLabelASReviewNumber: `${PREFIX}-tooltip-label-asreview-number`,
  tooltipLabelRandomNumber: `${PREFIX}-tooltip-label-random-number`,
  tooltipLabelTextSecondaryColor: `${PREFIX}-tooltip-label-text-secondary-color`,
  tooltipDividerColor: `${PREFIX}-tooltip-divider-color`,
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  maxWidth: 960,
  overflow: "visible",
  position: "relative",
  width: "100%",
  [`& .${classes.root}`]: {
    paddingTop: 24,
    paddingLeft: 32,
    paddingRight: 32,
  },
  [`& .${classes.tooltipCardColor}`]: {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
  },
  [`& .${classes.tooltipLabelContainer}`]: {
    display: "flex",
    justifyContent: "space-between",
  },
  [`& .${classes.tooltipLabelMarkerASReviewColor}`]: {
    ...theme.applyStyles("light", {
      color: theme.palette.primary.light,
      background: theme.palette.primary.light,
    }),
    ...theme.applyStyles("dark", {
      color: theme.palette.primary.main,
      background: theme.palette.primary.main,
    }),
  },
  [`& .${classes.tooltipLabelMarkerRandomColor}`]: {
    color: theme.palette.info.main,
    background: theme.palette.info.main,
  },
  [`& .${classes.tooltipLabelASReviewNumber}`]: {
    marginLeft: 32,
    ...theme.applyStyles("dark", {
      color: theme.palette.primary.main,
    }),
  },
  [`& .${classes.tooltipLabelRandomNumber}`]: {
    marginLeft: 32,
    color: theme.palette.info.main,
  },
  [`& .${classes.tooltipLabelTextSecondaryColor}`]: {
    color: theme.palette.text.secondary,
  },
  [`& .${classes.tooltipDividerColor}`]: {
    borderColor: theme.palette.divider,
  },
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: 0,
    maxWidth: 410,
    fontSize: theme.typography.pxToRem(12),
  },
}));

const customTooltip = ({ series, seriesIndex, dataPointIndex, w }) => {
  let total = dataPointIndex + 1;
  return (
    `<div class="tooltip-card ProgressRecallChart-tooltip-card-color">` +
    `<div class="tooltip-card-content">` +
    '<h6 class="tooltip-title">' +
    total +
    ` reviewed records` +
    "</h6>" +
    '<div class="ProgressRecallChart-tooltip-label-container">' +
    "<div>" +
    "<div>" +
    `<span class="apexcharts-legend-marker tooltip-label-marker ProgressRecallChart-tooltip-label-marker-asreview-color">` +
    "</span>" +
    `<span class="apexcharts-legend-text tooltip-label-text">` +
    "Relevant by ASReview LAB" +
    "</span>" +
    "</div>" +
    `<p class="tooltip-label-text-secondary ProgressRecallChart-tooltip-label-text-secondary-color">` +
    "Relevant records that you labeled assisted by the active learning model" +
    "</p>" +
    "</div>" +
    `<h6 class="tooltip-label-number ProgressRecallChart-tooltip-label-asreview-number">` +
    series[0][dataPointIndex] +
    "</h6>" +
    "</div>" +
    `<hr class="tooltip-divider ProgressRecallChart-tooltip-divider-color">` +
    '<div class="ProgressRecallChart-tooltip-label-container">' +
    "<div>" +
    "<div>" +
    `<span class="apexcharts-legend-marker tooltip-label-marker ProgressRecallChart-tooltip-label-marker-random-color">` +
    "</span>" +
    `<span class="apexcharts-legend-text tooltip-label-text">` +
    "Random relevant" +
    "</span>" +
    "</div>" +
    `<p class="tooltip-label-text-secondary ProgressRecallChart-tooltip-label-text-secondary-color">` +
    "Relevant records that you might find if you manually reviewed all the records" +
    "</p>" +
    "</div>" +
    `<h6 class="tooltip-label-number ProgressRecallChart-tooltip-label-random-number">` +
    series[1][dataPointIndex] +
    "</h6>" +
    "</div>" +
    "</div>" +
    "</div>"
  );
};

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

  const lightModePrimaryColor = useCallback(() => {
    return theme.palette.mode === "light"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  }, [theme.palette.mode, theme.palette.primary]);

  const darkBlueColor = useCallback(() => {
    return theme.palette.info.main;
  }, [theme.palette.info]);

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
          show: false, // Hide the toolbar, it's replaced by the download button
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
      tooltip: {
        custom: customTooltip,
      },
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
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (format) => {
    setAnchorEl(null);

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
          backgroundColor: theme.palette.background.paper,
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

  return (
    <StyledCard elevation={2}>
      <CardErrorHandler
        queryKey={"fetchGenericData"}
        error={props.progressRecallQuery?.error}
        isError={!!props.progressRecallQuery?.isError}
      />
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip
                title={
                  <React.Fragment>
                    <Card sx={{ backgroundImage: "none" }}>
                      <CardContent>
                        <Typography variant="subtitle2">
                          The chart shows how well the ASReview model and random
                          sampling identify relevant records.
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          The model helps prioritize relevant records, but not
                          all relevant records will be identified by the model.
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          The random relevant line shows the performance if you
                          manually reviewed all records without model
                          assistance.
                        </Typography>
                      </CardContent>
                    </Card>
                  </React.Fragment>
                }
              >
                <HelpOutline
                  sx={{ color: "text.secondary", marginRight: "8px" }}
                />
              </StyledTooltip>
              <IconButton onClick={handleDownloadClick}>
                <GetAppIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
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
            </Box>
          </Stack>
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
    </StyledCard>
  );
}
