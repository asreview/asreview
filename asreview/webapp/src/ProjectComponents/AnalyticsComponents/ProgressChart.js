import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

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

function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

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
              fontSize: theme.typography.h5.fontSize,
              fontFamily: theme.typography.h5.fontFamily,
              fontWeight: theme.typography.fontWeightBold,
            },
            total: {
              show: true,
              label: "Total Records",
              fontSize: theme.typography.subtitle1.fontSize,
              fontFamily: theme.typography.subtitle1.fontFamily,
              color: theme.palette.text.secondary,
              formatter: (w) => {
                return n_papers ? numberWithCommas(n_papers) : 0;
              },
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
      labels: ["Labeled", "Relevant"],
      legend: {
        show: true,
        position: "bottom",
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
      stroke: {
        lineCap: "round",
      },
      theme: {
        mode: theme.palette.mode,
      },
    };
  }, [theme, n_papers]);

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
          <Typography variant="h6">Current Progress</Typography>
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
