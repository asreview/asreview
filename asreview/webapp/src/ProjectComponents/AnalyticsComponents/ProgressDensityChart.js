import React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

const PREFIX = "ProgressDensityChart";

const classes = {
  root: `${PREFIX}-root`,
  tooltip: `${PREFIX}-tooltip`,
  tooltipText: `${PREFIX}-tooltipText`,
  tooltipNumber: `${PREFIX}-tooltipNumber`,
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

  [`& .${classes.tooltip}`]: {
    display: "flex",
    alignItems: "baseline",
  },

  [`& .${classes.tooltipNumber}`]: {
    marginRight: 8,
  },
}));

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ marginBottom: "8px" }}>
            Of the {ordinal_suffix_of(Math.max(label - 9, 1))} to{" "}
            {ordinal_suffix_of(label)} records reviewed
          </Typography>
          <div className={classes.tooltip}>
            <Typography
              className={classes.tooltipNumber}
              variant="h6"
              sx={{ color: "primary.main" }}
            >
              {payload ? payload[0].value : 0}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
              Relevant
            </Typography>
          </div>
          <div className={classes.tooltip}>
            <Typography
              className={classes.tooltipNumber}
              variant="h6"
              sx={{ color: "secondary.main" }}
            >
              {payload ? payload[1].value : 0}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
              Irrelevant
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default function ProgressDensityChart(props) {
  const theme = useTheme();

  return (
    <StyledCard elevation={2}>
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          <Typography variant="h6">Progress Density</Typography>
          <ResponsiveContainer minHeight={190}>
            <AreaChart data={props.progressDensityQuery["data"]}>
              <XAxis
                type="number"
                dataKey="Total"
                domain={["dataMin", "dataMax"]}
                interval="preserveStartEnd"
                allowDecimals={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                domain={[0, 10]}
                orientation="right"
                tickLine={false}
                tickMargin={12}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                align="left"
                verticalAlign="top"
                height={36}
                iconType="square"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="Relevant"
                stackId="1"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
                opacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="Irrelevant"
                stackId="1"
                stroke={theme.palette.secondary.main}
                fill={theme.palette.secondary.main}
                opacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
