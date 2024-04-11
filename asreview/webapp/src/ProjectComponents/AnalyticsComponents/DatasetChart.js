import React from "react";
import Chart from "react-apexcharts";
import useTheme from "@mui/material/styles";

export default function DatasetChart({ label, part, total }) {
  const theme = useTheme();

  const formattedTotal = React.useCallback(() => {
    return Math.round((part / total) * 1000) / 10 + "%";
  }, [total, part]);

  /**
   * Chart data array
   */
  const seriesArray = React.useCallback(() => {
    if (part && total) {
      return [Math.round((part / total) * 10000) / 100];
    } else {
      return [];
    }
  }, [part, total]);

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
              fontSize: theme.typography.h5.fontSize,
              fontFamily: theme.typography.h5.fontFamily,
              fontWeight: theme.typography.fontWeightBold,
            },
            total: {
              show: true,
              label: label,
              fontSize: theme.typography.subtitle1.fontSize,
              fontFamily: theme.typography.subtitle1.fontFamily,
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
  }, [theme, formattedTotal]);

  const [series, setSeries] = React.useState(seriesArray());
  const [options, setOptions] = React.useState({});

  React.useEffect(() => {
    setSeries(seriesArray());
    setOptions(optionsChart());
  }, [seriesArray, optionsChart]);

  return (
    <Chart
      options={options}
      series={series}
      type="radialBar"
      height={350}
      width="100%"
    />
  );
}
