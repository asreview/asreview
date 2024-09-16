import React, { useRef, useState, useEffect, useCallback } from "react";
import Chart from "react-apexcharts";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Tooltip,
  tooltipClasses,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { HelpOutline } from "@mui/icons-material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { toPng, toJpeg, toSvg } from "html-to-image";

import { CardErrorHandler } from "Components";
import { TypographySubtitle1Medium } from "StyledComponents/StyledTypography";

import tooltipRelevantLight from "images/progress_relevant_light.png";
import tooltipRelevantDark from "images/progress_relevant_dark.png";
import tooltipIrrelevantLight from "images/progress_irrelevant_light.png";
import tooltipIrrelevantDark from "images/progress_irrelevant_dark.png";

import "./AnalyticsPage.css";

const PREFIX = "ProgressDensityChart";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  tooltipCardColor: `${PREFIX}-tooltip-card-color`,
  tooltipLabelContainer: `${PREFIX}-tooltip-label-container`,
  tooltipLabelMarkerRelevantColor: `${PREFIX}-tooltip-label-marker-relevant-color`,
  tooltipLabelRelevantNumber: `${PREFIX}-tooltip-label-relevant-number`,
  tooltipLabelTextSecondaryColor: `${PREFIX}-tooltip-label-text-secondary-color`,
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
  [`& .${classes.title}`]: {
    display: "flex",
    alignItems: "baseline",
  },
  [`& .${classes.tooltipCardColor}`]: {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
  },
  [`& .${classes.tooltipLabelContainer}`]: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  [`& .${classes.tooltipLabelMarkerRelevantColor}`]: {
    ...theme.applyStyles("light", {
      color: theme.palette.primary.light,
      background: theme.palette.primary.light,
    }),
    ...theme.applyStyles("dark", {
      color: theme.palette.primary.main,
      background: theme.palette.primary.main,
    }),
  },
  [`& .${classes.tooltipLabelRelevantNumber}`]: {
    marginLeft: 20,
    ...theme.applyStyles("dark", {
      color: theme.palette.primary.main,
    }),
  },
  [`& .${classes.tooltipLabelTextSecondaryColor}`]: {
    color: theme.palette.text.secondary,
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
    `<div class="tooltip-card ProgressDensityChart-tooltip-card-color">` +
    '<div class="tooltip-card-content">' +
    '<h6 class="tooltip-title">' +
    total +
    ` reviewed records` +
    "</h6>" +
    `<div class="ProgressDensityChart-tooltip-label-container">` +
    "<div>" +
    "<div>" +
    `<span class="apexcharts-legend-marker tooltip-label-marker ProgressDensityChart-tooltip-label-marker-relevant-color">` +
    "</span>" +
    `<span class="apexcharts-legend-text tooltip-label-text">` +
    "Relevant in last 10 reviewed" +
    "</span>" +
    "</div>" +
    `<p class="tooltip-label-text-secondary ProgressDensityChart-tooltip-text-secondary-color">` +
    "Relevant records that you labeled in the last 10 reviewed" +
    "</p>" +
    "</div>" +
    `<h6 class="tooltip-label-number ProgressDensityChart-tooltip-label-relevant-number">` +
    series[0][dataPointIndex] +
    "</h6>" +
    "</div>" +
    "</div>" +
    "</div>"
  );
};

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
  const [anchorEl, setAnchorEl] = useState(null);

  const returnTooltipRelevantImg = () => {
    if (theme.palette.mode === "light") {
      return tooltipRelevantLight;
    }
    if (theme.palette.mode === "dark") {
      return tooltipRelevantDark;
    }
  };

  const returnTooltipIrrelevantImg = () => {
    if (theme.palette.mode === "light") {
      return tooltipIrrelevantLight;
    }
    if (theme.palette.mode === "dark") {
      return tooltipIrrelevantDark;
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
          show: false, // Hiding the toolbar because it's replaced by the download button
        },
      },
      colors: [
        theme.palette.mode === "light"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
        "#CED4DC",
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
      tooltip: {
        custom: customTooltip,
      },
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
          text: "Relevant Records",
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
        error={props.genericDataQuery?.error}
        isError={!!props.genericDataQuery?.isError}
      />
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          <Box
            className={classes.title}
            sx={{ justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip
                title={
                  <React.Fragment>
                    <Card sx={{ backgroundImage: "none" }}>
                      <CardContent>
                        <Stack spacing={2}>
                          <Box sx={{ display: "flex" }}>
                            <Stack direction="row" spacing={2}>
                              <img
                                src={returnTooltipRelevantImg()}
                                alt="tooltip relevant"
                                className="tooltip-img"
                              />
                              <Box>
                                <Typography variant="subtitle2">
                                  Presence of relevant records
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  Relevant records still appear. Continue
                                  reviewing to discover more.
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          <Box sx={{ display: "flex" }}>
                            <Stack direction="row" spacing={2}>
                              <img
                                src={returnTooltipIrrelevantImg()}
                                alt="tooltip irrelevant"
                                className="tooltip-img"
                              />
                              <Box>
                                <Typography variant="subtitle2">
                                  Irrelevant records only
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  Relevant records do not appear. Refer to your
                                  stopping rule to decide if you want to
                                  continue reviewing.
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Stack>
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
    </StyledCard>
  );
}
