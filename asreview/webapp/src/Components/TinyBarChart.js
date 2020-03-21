import React, { useState } from 'react'
import {
    BarChart, 
    Bar, 
    Cell, 
    XAxis, 
    YAxis, 
    CartesianAxis,
    Tooltip, 
    Legend,
} from 'recharts';
import { makeStyles } from '@material-ui/core/styles'

/*
const useStyles = makeStyles({
});
*/

/*
TotalPapers 12000
NofChunks 9
ChunkSize 100
*/


const TinyBarChart = (props) => {
  	return (
    	<BarChart width={200} height={80} data={props.barchartData}>
            <CartesianAxis />
            <XAxis dataKey="label"/>
            <Bar dataKey="included" stackId="a" fill="#23dbff" background={{ fill: '#0099ff' }}/>
       </BarChart>
    );
}

export default TinyBarChart;

