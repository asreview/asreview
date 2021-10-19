import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { CardErrorHandler } from "../../Components";

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
    ...(theme.palette.mode === "light" && {
      color: theme.palette.primary.light,
      background: theme.palette.primary.light,
    }),
    ...(theme.palette.mode === "dark" && {
      color: theme.palette.primary.main,
      background: theme.palette.primary.main,
    }),
  },

  [`& .${classes.tooltipLabelMarkerRandomColor}`]: {
    ...(theme.palette.mode === "light" && {
      color: theme.palette.secondary.light,
      background: theme.palette.secondary.light,
    }),
    ...(theme.palette.mode === "dark" && {
      color: theme.palette.secondary.main,
      background: theme.palette.secondary.main,
    }),
  },

  [`& .${classes.tooltipLabelASReviewNumber}`]: {
    marginLeft: 32,
    ...(theme.palette.mode === "dark" && {
      color: theme.palette.primary.main,
    }),
  },

  [`& .${classes.tooltipLabelRandomNumber}`]: {
    marginLeft: 32,
    ...(theme.palette.mode === "dark" && {
      color: "#CED4DC",
    }),
  },

  [`& .${classes.tooltipLabelTextSecondaryColor}`]: {
    color: theme.palette.text.secondary,
  },

  [`& .${classes.tooltipDividerColor}`]: {
    borderColor: theme.palette.divider,
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
    "Inclusions by ASReview LAB" +
    "</span>" +
    "</div>" +
    `<p class="tooltip-label-text-secondary ProgressRecallChart-tooltip-label-text-secondary-color">` +
    "Relevant records you labeled assisted by the active learning model" +
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
    "Random inclusions" +
    "</span>" +
    "</div>" +
    `<p class="tooltip-label-text-secondary ProgressRecallChart-tooltip-label-text-secondary-color">` +
    "Relevant records you may find so far if you manually review all the records" +
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

export default function ProgressRecallChart(props) {
  const theme = useTheme();

  const lightModePrimaryColor = React.useCallback(() => {
    return theme.palette.mode === "light"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  }, [theme.palette.mode, theme.palette.primary]);

  const lightModeSecondaryColor = React.useCallback(() => {
    return theme.palette.mode === "light"
      ? theme.palette.secondary.light
      : theme.palette.secondary.main;
  }, [theme.palette.mode, theme.palette.secondary]);

  /**
   * Chart data array
   */
  const seriesArray = React.useCallback(() => {
    if (props.progressRecallQuery.data) {
      return [
        {
          name: "Inclusions by ASReview LAB",
          data: props.progressRecallQuery.data?.asreview,
        },
        {
          name: "Random inclusions",
          data: props.progressRecallQuery.data?.random,
        },
      ];
    } else {
      return [];
    }
  }, [props.progressRecallQuery.data]);

  const maxY = React.useCallback(() => {
    if (seriesArray()[0]?.data !== undefined) {
      return Math.max.apply(
        Math,
        seriesArray()[0]?.data.map((element) => {
          return element.y;
        })
      );
    } else {
      return undefined;
    }
  }, [seriesArray]);

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
        id: "ASReviewLABprogressRecall",
        type: "line",
        zoom: {
          enabled: false,
        },
      },
      colors: [lightModePrimaryColor(), lightModeSecondaryColor()],
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
        type: "numeric",
        axisTicks: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        showAlways: false,
        max: maxY(),
        forceNiceScale: false,
        opposite: true,
        tickAmount: 6,
      },
    };
  }, [theme, lightModePrimaryColor, lightModeSecondaryColor, maxY]);

  const [series, setSeries] = React.useState(seriesArray());
  const [options, setOptions] = React.useState(optionsChart());

  React.useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <StyledCard elevation={2}>
      <CardErrorHandler
        queryKey={"fetchProgressRecall"}
        error={props.progressRecallQuery.error}
        isError={props.progressRecallQuery.isError}
      />
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          <Typography variant="h6">Progress Recall</Typography>
          <Chart
            options={options}
            series={series}
            type="line"
            height={400}
            width="100%"
          />
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
