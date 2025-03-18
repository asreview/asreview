import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PieChart } from "@mui/x-charts";

const getChartColor = (theme, part, total) => {
  switch (true) {
    case part / total < 0.75:
      return theme.palette.error.main;
    case part / total < 0.95:
      return theme.palette.warning.main;
    default:
      return theme.palette.success.main;
  }
};

export default function DatasetChart({ label, part, total }) {
  const theme = useTheme();
  const percentage = Math.round((part / total) * 1000) / 10;

  return (
    <Stack direction="column" alignItems="center">
      <PieChart
        series={[
          {
            data: [
              { value: percentage, color: getChartColor(theme, part, total) },
              { value: 100 - percentage, color: theme.palette.grey[200] },
            ],
            innerRadius: 60,
          },
        ]}
        height={180}
        width={180}
        slotProps={{
          legend: {
            hidden: true,
          },
        }}
        margin={{ right: 5, left: 5, top: 5, bottom: 5 }}
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: theme.typography.h6.fontSize,
            fontWeight: "bold",
            fill: theme.palette.text.secondary,
          }}
        >
          {`${percentage}%`}
        </text>
      </PieChart>
      <Typography align="center" variant="subtitle1">
        {label}
      </Typography>
    </Stack>
  );
}
