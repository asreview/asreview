import React from "react";
import Chart from "react-apexcharts";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Tooltip,
  tooltipClasses,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { HelpOutline } from "@mui/icons-material";

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
    ...(theme.palette.mode === "light" && {
      color: theme.palette.primary.light,
      background: theme.palette.primary.light,
    }),
    ...(theme.palette.mode === "dark" && {
      color: theme.palette.primary.main,
      background: theme.palette.primary.main,
    }),
  },

  [`& .${classes.tooltipLabelRelevantNumber}`]: {
    marginLeft: 20,
    ...(theme.palette.mode === "dark" && {
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
    `<p class="tooltip-label-text-secondary ProgressDensityChart-tooltip-label-text-secondary-color">` +
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

export default function ProgressDensityChart(props) {
  const theme = useTheme();

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

  /**
   * Chart data array
   */
  const seriesArray = React.useCallback(() => {
    if (props.progressDensityQuery.data) {
      return [
        {
          name: "Relevant records",
          data: props.progressDensityQuery.data?.relevant,
        },
      ];
    } else {
      return [];
    }
  }, [props.progressDensityQuery.data]);

  /**
   * Chart options
   */
  const optionsChart = React.useCallback(() => {
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
          show: !props.mobileScreen,
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
        fontSize: !props.mobileScreen ? "14px" : "12px",
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
          text: "Number of reviewed records",
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
        tickAmount: 3,
        title: {
          text: "Number of relevant records",
        },
      },
    };
  }, [theme, props.mobileScreen]);

  const [series, setSeries] = React.useState(seriesArray());
  const [options, setOptions] = React.useState(optionsChart());

  React.useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <StyledCard elevation={2}>
      <CardErrorHandler
        queryKey={"fetchProgressDensity"}
        error={props.progressDensityQuery.error}
        isError={props.progressDensityQuery.isError}
      />
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          <Box className={classes.title}>
            {!props.mobileScreen && (
              <Typography variant="h6">Progress</Typography>
            )}
            {props.mobileScreen && (
              <TypographySubtitle1Medium>Progress</TypographySubtitle1Medium>
            )}
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
                                stopping rule to decide if you want to continue
                                reviewing.
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
                fontSize={!props.mobileScreen ? "small" : "12px"}
                sx={{ color: "text.secondary", marginLeft: "8px" }}
              />
            </StyledTooltip>
          </Box>
          <Chart
            options={options}
            series={series}
            type="area"
            height={230}
            width="100%"
          />
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
