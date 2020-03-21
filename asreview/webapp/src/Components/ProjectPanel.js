import React from 'react';
import {
    Typography,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const ProjectPanel = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <ExpansionPanel>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                <Typography className={classes.heading}>Project</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Typography variant='caption' component="p">
                    Project name<br />
                    Project dataset<br />
                    Session time<br />
                </Typography>
            </ExpansionPanelDetails>
            </ExpansionPanel>
        </div>
    );
}

export default ProjectPanel;