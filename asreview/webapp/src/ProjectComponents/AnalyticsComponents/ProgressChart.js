import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, Skeleton } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { projectModes } from "globals.js";

const PREFIX = "ProgressChart";

const classes = {
  root: `${PREFIX}-root`,
};

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 960,
  overflow: "visible",
  width: "100%",
  [`& .${classes.root}`]: {
    paddingTop: 24,
    paddingLeft: 32,
    paddingRight: 32,
  },
}));

export default function ProgressChart(props) {
  const theme = useTheme();

  const n_included = props.progressQuery.data
    ? props.progressQuery.data["n_included"]
    : null;
  const n_excluded = props.progressQuery.data
    ? props.progressQuery.data["n_excluded"]
    : null;
  const n_papers = props.progressQuery.data
    ? props.progressQuery.data["n_papers"]
    : null;
  const n_included_no_priors = props.progressQuery.data
    ? props.progressQuery.data["n_included_no_priors"]
    : null;
  const n_excluded_no_priors = props.progressQuery.data
    ? props.progressQuery.data["n_excluded_no_priors"]
    : null;

  const formattedTotal = React.useCallback(() => {
    if (props.mode !== projectModes.SIMULATION || !props.isSimulating) {
      return n_papers ? n_papers.toLocaleString("en-US") : 0;
    } else {
      return (
        Math.round(((n_included + n_excluded) / n_papers) * 10000) / 100 + "%"
      );
    }
  }, [props.isSimulating, props.mode, n_included, n_excluded, n_papers]);

  /**
   * Chart data array
   */
  const seriesArray = React.useCallback(() => {
    if (props.includePriorKnowledge) {
      return [
        Math.round(((n_included + n_excluded) / n_papers) * 10000) / 100,
        Math.round((n_included / n_papers) * 10000) / 100,
      ];
    } else {
      return [
        Math.round(
          ((n_included_no_priors + n_excluded_no_priors) / n_papers) * 10000,
        ) / 100,
        Math.round((n_included_no_priors / n_papers) * 10000) / 100,
      ];
    }
  }, [
    n_included,
    n_excluded,
    n_papers,
    props.includePriorKnowledge,
    n_included_no_priors,
    n_excluded_no_priors,
  ]);

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
        id: "ASReviewLABprogressChart",
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 15,
            size: "60%",
          },
          dataLabels: {
            name: {
              fontSize: "22px",
            },
            value: {
              fontSize: !props.mobileScreen
                ? theme.typography.h5.fontSize
                : theme.typography.h6.fontSize,
              fontFamily: !props.mobileScreen
                ? theme.typography.h5.fontFamily
                : theme.typography.h6.fontFamily,
              fontWeight: theme.typography.fontWeightBold,
            },
            total: {
              show: true,
              label:
                props.mode !== projectModes.SIMULATION || !props.isSimulating
                  ? "Total records"
                  : "Simulation progress",
              fontSize: !props.mobileScreen
                ? theme.typography.subtitle1.fontSize
                : theme.typography.subtitle2.fontSize,
              fontFamily: !props.mobileScreen
                ? theme.typography.subtitle1.fontFamily
                : theme.typography.subtitle2.fontFamily,
              color: theme.palette.text.secondary,
              formatter: formattedTotal,
            },
          },
        },
      },
      colors: props.includePriorKnowledge
        ? [
            theme.palette.mode === "light"
              ? theme.palette.background.default
              : theme.palette.secondary.main,
            theme.palette.mode === "light"
              ? theme.palette.background.default
              : theme.palette.primary.main,
            theme.palette.mode === "light"
              ? theme.palette.warning.light
              : theme.palette.warning.main,
          ]
        : [
            theme.palette.mode === "light"
              ? theme.palette.background.default
              : theme.palette.secondary.main,
            theme.palette.mode === "light"
              ? theme.palette.warning.light
              : theme.palette.warning.main,
          ],
      dataLabels: {
        enabled: false,
      },
      labels: props.includePriorKnowledge
        ? ["Labeled", "Relevant"]
        : ["Labeled", "Relevant"],
      legend: {
        show: true,
        position: "bottom",
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
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0,
          inverseColors: true,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      },
      markers: {
        size: 0,
      },
      noData: {
        text: "No data available",
      },
      stroke: {
        lineCap: "round",
      },
      theme: {
        mode: theme.palette.mode,
      },
    };
  }, [
    theme,
    formattedTotal,
    props.mobileScreen,
    props.mode,
    props.isSimulating,
    props.includePriorKnowledge,
  ]);

  const [series, setSeries] = React.useState(seriesArray());
  const [options, setOptions] = React.useState({});

  React.useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <StyledCard elevation={2}>
      <CardContent className={classes.root}>
        {props.progressQuery.isLoading ? (
          <Skeleton
            variant="circular"
            width={300}
            height={300}
            style={{ margin: "auto" }}
          />
        ) : (
          <Chart
            options={options}
            series={series}
            type="radialBar"
            height={300}
            width={300}
          />
        )}
      </CardContent>
    </StyledCard>
  );
}
