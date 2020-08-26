import React from 'react';
import {
  ResponsiveContainer, Cell, PieChart, Pie, Tooltip,
} from 'recharts';


const ProgressPieChart = (props) => {

  const getData = () => {
    return([
      { name: 'Relevant', value: props.n_included }, { name: 'Irrelevant', value: props.n_excluded }
    ])
  }


  return (
    <ResponsiveContainer 
      minHeight={90}
      width="100%"
    >
      <PieChart>
        <Pie
          isAnimationActive={false}
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={getData()}
          cy={90}
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
