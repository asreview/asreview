import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./RechartsTooltip.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Total reviewed: ${label}`}</p>
        <p className="intro">Relevant found</p>
        <p className="asreview">{`By ASReview: ${payload[0].value}`}</p>
        <p className="random">{`At random: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const ProgressLineChart = (props) => {
  return (
    <ResponsiveContainer minHeight={130}>
      <LineChart data={props.efficiency}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Total" type="number" domain={[1, "dataMax"]} />
        <YAxis domain={[0, "dataMax"]} hide={true} />
        <Tooltip content={<CustomTooltip />} labelStyle={{ color: "black" }} />
        <Line
          type="monotone"
          dataKey="Relevant"
          stroke="#FFCD00"
          strokeWidth="1.75"
          animationEasing="ease-out"
          dot={false}
        />
        <Line
          type="linear"
          dataKey="Random"
          name="Random inclusion"
          stroke="#000000"
          strokeWidth="1"
          animationEasing="ease-in"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressLineChart;
