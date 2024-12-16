import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Chart from "react-apexcharts";

const chartcolor = (theme, part, total) => {
  switch (true) {
    case part / total < 0.75:
      return [theme.palette.error.main];
    case part / total < 0.95:
      return [theme.palette.warning.main];
    default:
      return [theme.palette.success.main];
  }
};

export default function DatasetChart({ label, part, total }) {
  const theme = useTheme();

  return (
    <Stack direction="column">
      <Chart
        options={{
          chart: {
            background: "transparent",
            id: "ASReviewLABDatasetChart",
            type: "radialBar",
          },
          states: {
            hover: {
              filter: {
                type: "none",
              },
            },
            active: {
              filter: {
                type: "none",
              },
            },
          },
          plotOptions: {
            radialBar: {
              hollow: {
                margin: 15,
                size: "50%",
              },
              dataLabels: {
                name: {
                  show: false,
                },
                value: {
                  show: true,
                  offsetY: 7,
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
            colors: chartcolor(theme, part, total),
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
        width="100%"
      />
      <Typography align="center" variant="subtitle1">
        {label}
      </Typography>
    </Stack>
  );
}
