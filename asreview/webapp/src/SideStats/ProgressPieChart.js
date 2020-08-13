import React, { } from 'react';
import {
  ResponsiveContainer, Cell, PieChart, Pie, Tooltip,
} from 'recharts';

import {reviewDrawerWidth} from '../globals.js'


const ProgressPieChart = (props) => {


  const getData = () => {
    return([
      { name: 'Relevant', value: props.n_included }, { name: 'Irrelevant', value: props.n_excluded }
    ])
  }


  return (
    <ResponsiveContainer minHeight={(reviewDrawerWidth/2)-30}>
      <PieChart>
        <Pie
          isAnimationActive={false}
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={getData()}
          cx={reviewDrawerWidth/2}
          cy={(reviewDrawerWidth/2)-35}
          innerRadius={0}
          outerRadius={65}
          fill="#8884d8"
          label
        >
        <Cell fill={'#00C49F'}/>
        <Cell fill={'#FF8042'}/>
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default ProgressPieChart;
