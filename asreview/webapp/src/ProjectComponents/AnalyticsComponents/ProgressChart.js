import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";

const PREFIX = "ProgressChart";

const classes = {
  root: `${PREFIX}-root`,
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

  const formattedTotal = React.useCallback(() => {
    return n_papers ? n_papers.toLocaleString("en-US") : 0;
  }, [n_papers]);

  /**
   * Chart data array
   */
  const seriesArray = React.useCallback(() => {
    if (n_included && n_excluded && n_papers) {
      return [
        Math.round(((n_included + n_excluded) / n_papers) * 10000) / 100,
        Math.round((n_included / n_papers) * 10000) / 100,
      ];
    } else {
      return [];
    }
  }, [n_included, n_excluded, n_papers]);

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
              label: "Total Records",
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
      colors: [
        theme.palette.mode === "light"
          ? theme.palette.secondary.light
          : theme.palette.secondary.main,
        theme.palette.mode === "light"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
      ],
      dataLabels: {
        enabled: false,
      },
      labels: ["Labeled", "Relevant"],
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
  }, [theme, formattedTotal, props.mobileScreen]);

  const [series, setSeries] = React.useState(seriesArray());
  const [options, setOptions] = React.useState({});

  React.useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <StyledCard elevation={2}>
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          {!props.mobileScreen && (
            <Typography variant="h6">Current Progress</Typography>
          )}
          {props.mobileScreen && (
            <TypographySubtitle1Medium>
              Current Progress
            </TypographySubtitle1Medium>
          )}
          <Chart
            options={options}
            series={series}
            type="radialBar"
            height={350}
            width="100%"
          />
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
