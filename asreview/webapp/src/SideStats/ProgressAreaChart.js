import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';


const ProgressBarChart = (props) => {

  return (
    <AreaChart
      width={props.width}
      height={props.height}
      margin={props.margin}
      data={props.history}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" dataKey="Total" domain={["dataMin", "dataMax"]} interval="preserveStartEnd" allowDecimals={false}/>
      <YAxis domain={[0, 10]} hide={true} />
      <Tooltip labelFormatter={(Total) => Math.max(Total-9, 1)+"–"+Total} />
      <Area type="monotone" dataKey="Relevant" stackId="1" stroke="#00C49F" fill="#00C49F" opacity={0.6} />
      <Area type="monotone" dataKey="Irrelevant" stackId="1" stroke="#FF8042" fill="#FF8042" opacity={0.6} />
    </AreaChart>
  );
}

export default ProgressBarChart;
