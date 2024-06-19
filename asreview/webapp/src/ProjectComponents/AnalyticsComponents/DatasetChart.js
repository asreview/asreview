import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";

export default function DatasetChart({ label, part, total }) {
  const theme = useTheme();

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
    <Box sx={{ height: "210px" }}>
      <Chart
        options={{
          chart: {
            background: "transparent",
            id: "ASReviewLABDatasetChart",
            type: "radialBar",
          },
          plotOptions: {
            radialBar: {
              hollow: {
                margin: 15,
                size: "50%",
              },
              dataLabels: {
                name: {
                  show: true,
                  offsetY: 90,
                  fontSize: theme.typography.subtitle1.fontSize,
                  fontFamily: theme.typography.subtitle1.fontFamily,
                  color: theme.palette.text.secondary,
                },
                value: {
                  show: true,
                  offsetY: -10,
                  fontSize: theme.typography.subtitle1.fontSize,
                  fontWeight: "bold",
                  fontFamily: theme.typography.subtitle1.fontFamily,
                  color: theme.palette.text.secondary,
                  formatter: function (val) {
                    return Math.round((part / total) * 1000) / 10 + "%";
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
          fill: {
            colors: chartcolor(),
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
          labels: [label],
        }}
        series={[Math.round((part / total) * 10000) / 100]}
        type="radialBar"
        height={210}
        width={"100%"}
      />
    </Box>
  );
}
