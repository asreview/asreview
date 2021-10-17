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

import "./AnalyticsPage.css";

const PREFIX = "ProgressDensityChart";

const classes = {
  root: `${PREFIX}-root`,
  tooltip: `${PREFIX}-tooltip`,
  title: `${PREFIX}-title`,
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

  [`& .${classes.tooltip}`]: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },

  [`& .${classes.title}`]: {
    display: "flex",
    alignItems: "baseline",
  },
}));

const irrelevantColor = "#CED4DC";

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
    maxWidth: 300,
    fontSize: theme.typography.pxToRem(12),
  },
}));

export default function ProgressDensityChart(props) {
  const theme = useTheme();

  const lightModePrimaryColor = React.useCallback(() => {
    return theme.palette.mode === "light"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  }, [theme.palette.mode, theme.palette.primary]);

  const customTooltip = React.useCallback(
    ({ series, seriesIndex, dataPointIndex, w }) => {
      let from = ordinal_suffix_of(Math.max(dataPointIndex - 8, 1));
      let to = ordinal_suffix_of(dataPointIndex + 1);
      return (
        `<div class="tooltip-container" style="background-color: ${theme.palette.background.paper}">` +
        '<h6 class="tooltip-title">' +
        from +
        ` to ` +
        to +
        ` records reviewed` +
        "</h6>" +
        '<div class="tooltip-label">' +
        "<div>" +
        `<span class="apexcharts-legend-marker tooltip-label-marker" style="background: ${lightModePrimaryColor()} !important; color: ${lightModePrimaryColor()}">` +
        "</span>" +
        `<span class="apexcharts-legend-text tooltip-label-text" style="color: ${theme.palette.text.secondary}">` +
        "Relevant records" +
        "</span>" +
        "</div>" +
        `<h6 class="tooltip-label-number" style="color: ${
          theme.palette.mode === "light" ? "inherit" : lightModePrimaryColor()
        };">` +
        series[0][dataPointIndex] +
        "</h6>" +
        "</div>" +
        '<div class="tooltip-label">' +
        "<div>" +
        `<span class="apexcharts-legend-marker tooltip-label-marker" style="background: ${irrelevantColor} !important; color: ${irrelevantColor}">` +
        "</span>" +
        `<span class="apexcharts-legend-text tooltip-label-text" style="color: ${theme.palette.text.secondary};">` +
        "Irrelevant records" +
        "</span>" +
        "</div>" +
        `<h6 class="tooltip-label-number" style="color: ${
          theme.palette.mode === "light" ? "inherit" : irrelevantColor
        };">` +
        series[1][dataPointIndex] +
        "</h6>" +
        "</div>" +
        "</div>"
      );
    },
    [theme.palette, lightModePrimaryColor]
  );

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
        background: "transparent",
        id: "ASReviewLABprogressDensity",
        type: "area",
        stacked: true,
      },
      colors: [lightModePrimaryColor(), "#CED4DC"],
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: theme.palette.mode === "light" ? 0.9 : 0.2,
          opacityFrom: 0.7,
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
  }, [theme, lightModePrimaryColor, customTooltip]);

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
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">
                            Presence of relevant records
                          </Typography>
                          <Typography variant="body2">
                            More relevant records may appear. Continue reviewing
                            to discover more.
                          </Typography>
                        </Box>
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
            height={230}
            width="100%"
          />
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
