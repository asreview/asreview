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

import tooltipRelevantLight from "../../images/progress_density_relevant_light.png";
import tooltipRelevantDark from "../../images/progress_density_relevant_dark.png";
import tooltipIrrelevantLight from "../../images/progress_density_irrelevant_light.png";
import tooltipIrrelevantDark from "../../images/progress_density_irrelevant_dark.png";

import "./AnalyticsPage.css";

const PREFIX = "ProgressDensityChart";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  tooltipCardColor: `${PREFIX}-tooltip-card-color`,
  tooltipLabelContainer: `${PREFIX}-tooltip-label-container`,
  tooltipLabelMarkerRelevantColor: `${PREFIX}-tooltip-label-marker-relevant-color`,
  tooltipLabelMarkerIrrelevantColor: `${PREFIX}-tooltip-label-marker-irrelevant-color`,
  tooltipLabelRelevantNumber: `${PREFIX}-tooltip-label-relevant-number`,
  tooltipLabelIrrelevantNumber: `${PREFIX}-tooltip-label-irrelevant-number`,
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  maxWidth: 960,
  overflow: "visible",
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

  [`& .${classes.tooltipLabelMarkerIrrelevantColor}`]: {
    color: "#CED4DC",
    background: "#CED4DC",
  },

  [`& .${classes.tooltipLabelRelevantNumber}`]: {
    marginLeft: 20,
    ...(theme.palette.mode === "dark" && {
      color: theme.palette.primary.main,
    }),
  },

  [`& .${classes.tooltipLabelIrrelevantNumber}`]: {
    marginLeft: 20,
    ...(theme.palette.mode === "dark" && {
      color: "#CED4DC",
    }),
  },
}));

function ordinal_suffix_of(i) {
  var j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}

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
  let from = ordinal_suffix_of(Math.max(dataPointIndex - 8, 1));
  let to = ordinal_suffix_of(dataPointIndex + 1);
  return (
    `<div class="tooltip-card ProgressDensityChart-tooltip-card-color">` +
    '<div class="tooltip-card-content">' +
    '<h6 class="tooltip-title" style="margin-bottom: 8px;">' +
    from +
    ` to ` +
    to +
    ` reviewed records` +
    "</h6>" +
    `<div class="ProgressDensityChart-tooltip-label-container">` +
    "<div>" +
    `<span class="apexcharts-legend-marker tooltip-label-marker ProgressDensityChart-tooltip-label-marker-relevant-color">` +
    "</span>" +
    `<span class="apexcharts-legend-text tooltip-label-text">` +
    "Relevant records" +
    "</span>" +
    "</div>" +
    `<h6 class="tooltip-label-number ProgressDensityChart-tooltip-label-relevant-number">` +
    series[0][dataPointIndex] +
    "</h6>" +
    "</div>" +
    `<div class="ProgressDensityChart-tooltip-label-container">` +
    "<div>" +
    `<span class="apexcharts-legend-marker tooltip-label-marker ProgressDensityChart-tooltip-label-marker-irrelevant-color">` +
    "</span>" +
    `<span class="apexcharts-legend-text tooltip-label-text">` +
    "Irrelevant records" +
    "</span>" +
    "</div>" +
    `<h6 class="tooltip-label-number ProgressDensityChart-tooltip-label-irrelevant-number">` +
    series[1][dataPointIndex] +
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
    return [
      {
        name: "Relevant records",
        data: props.progressDensityQuery.data?.relevant,
      },
      {
        name: "Irrelevant records",
        data: props.progressDensityQuery.data?.irrelevant,
      },
    ];
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
        type: "numeric",
        labels: {
          show: false,
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
        opposite: true,
        max: 10,
        tickAmount: 3,
      },
    };
  }, [theme]);

  const [series, setSeries] = React.useState(seriesArray());
  const [options, setOptions] = React.useState(optionsChart());

  React.useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <StyledCard elevation={2}>
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          <Box className={classes.title}>
            <Typography variant="h6">Progress Density</Typography>
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
                              class="tooltip-img"
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                Presence of relevant records
                              </Typography>
                              <Typography variant="body2">
                                More relevant records may appear. Continue
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
                              class="tooltip-img"
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                Persistent irrelevant records
                              </Typography>
                              <Typography variant="body2">
                                More relevant records might not appear. Refer to
                                your stopping rules to decide if you want to
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
                fontSize="small"
                sx={{ color: "text.secondary", marginLeft: "8px" }}
              />
            </StyledTooltip>
          </Box>
          <Chart
            options={options}
            series={series}
            type="area"
            height={200}
            width="100%"
          />
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
