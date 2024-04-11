import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";

export default function DatasetChart({ label, part, total }) {
  const theme = useTheme();

  const formattedTotal = React.useCallback(() => {
    return Math.round((part / total) * 1000) / 10 + "%";
  }, [total, part]);

  const chartcolor = () => {
    if (part / total < 0.75) {
      return ["#F44336"];
    } else if (part / total < 0.95) {
      return ["#FFC107"];
    } else {
      return ["#4CAF50"];
    }
  };

  return (
    <Chart
      options={{
        chart: {
          animations: {
            enabled: false,
          },
          background: "transparent",
          id: "ASReviewLABDatasetChart",
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
          colors: chartcolor(),
          gradient: {
            shade: "light",
            type: "horizontal",
            shadeIntensity: 0,
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
        theme: {
          mode: theme.palette.mode,
        },
      }}
      series={[Math.round((part / total) * 10000) / 100]}
      type="radialBar"
      height={350}
      width="100%"
    />
  );
}
