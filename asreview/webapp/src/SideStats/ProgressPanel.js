import React from 'react';
import {
    ListSubheader,
    ListItem,
} from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles(theme => ({
//   root: {
//     width: '100%',
//   },
//   heading: {
//     fontSize: theme.typography.pxToRem(15),
//     fontWeight: theme.typography.fontWeightRegular,
//   },
// }));

const ProgressPanel = (props) => {
    // const classes = useStyles();

    return (
 
        <div>
          <ListSubheader component="div" id="list-subheader-progress">
            Progress
          </ListSubheader> 
          {/*<LinearProgress variant="determinate" value="10" color="primary" />*/}
          <ListItem key="list-progress-total_labeled">
            Total reviewed: {props.n_included + props.n_excluded}
          </ListItem>
          <ListItem key="list-progress-inclusions">
            Relevant: {props.n_included}
          </ListItem>
          <ListItem key="list-progress-exclusions">
            Irrelevent: {props.n_excluded}
          </ListItem>
        </div>

    );
}

export default ProgressPanel;
