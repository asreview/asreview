import React from "react";
import {
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

const PREFIX = "ProgressRecallChart";

const classes = {
  root: `${PREFIX}-root`,
  legendText: `${PREFIX}-legendText`,
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

  [`& .${classes.legendText}`]: {
    fontSize: "0.875rem",
    fontWeight: 500,
    letterSpacing: "0.00714em",
    lineHeight: 1.57,
  },

  [`& .${classes.tooltip}`]: {
    display: "flex",
    justifyContent: "space-between",
  },

  [`& .${classes.tooltipText}`]: {
    color: theme.palette.text.secondary,
    maxWidth: 240,
  },

  [`& .${classes.tooltipNumber}`]: {
    marginLeft: 32,
  },
}));

const renderLegendText = (value: string, entry: any) => {
  return <span className={classes.legendText}>{value}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ marginBottom: "8px" }}>
            {label} Records reviewed
          </Typography>
          <div className={classes.tooltip}>
            <div>
              <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
                Inclusions by ASReview LAB
              </Typography>
              <Typography className={classes.tooltipText} variant="body2">
                Relevant records you labeled assisted by the active learning
                model
              </Typography>
            </div>
            <Typography
              className={classes.tooltipNumber}
              variant="h6"
              sx={{ color: "primary.main" }}
            >
              {payload ? payload[0].value : 0}
            </Typography>
          </div>
          <Divider sx={{ margin: "8px 0px" }} />
          <div className={classes.tooltip}>
            <div>
              <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
                Random inclusions
              </Typography>
              <Typography className={classes.tooltipText} variant="body2">
                Relevant records you may find so far if you screen all the
                records
              </Typography>
            </div>
            <Typography
              className={classes.tooltipNumber}
              variant="h6"
              sx={{ color: "secondary.main" }}
            >
              {payload ? payload[1].value : 0}
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default function ProgressRecallChart(props) {
  const theme = useTheme();

  return (
    <StyledCard elevation={2}>
      <CardContent className={classes.root}>
        <Stack spacing={2}>
          <Typography variant="h6">Progress Recall</Typography>
          <ResponsiveContainer minHeight={360}>
            <LineChart data={props.progressRecallQuery["data"]}>
              <XAxis
                dataKey="Total"
                type="number"
                domain={[1, "dataMax"]}
                interval="preserveStartEnd"
                allowDecimals={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                domain={[0, "dataMax"]}
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
                iconType="plainline"
                formatter={renderLegendText}
              />
              <Line
                type="monotone"
                dataKey="Relevant"
                name="Inclusions by ASReview LAB"
                stroke={theme.palette.primary.main}
                strokeWidth="1.75"
                animationEasing="ease-out"
                dot={false}
              />
              <Line
                type="linear"
                dataKey="Random"
                name="Random inclusions"
                stroke={theme.palette.secondary.main}
                strokeWidth="1"
                animationEasing="ease-in"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </StyledCard>
  );
}
