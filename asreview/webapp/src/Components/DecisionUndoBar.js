import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { decisionUndoBarDuration, decisionUndoBarMarginBottom } from '../globals.js'

const useStyles = makeStyles(theme => ({
  root: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
  snackbar: {
    marginBottom: decisionUndoBarMarginBottom,
  },
  undoButton: {
    color: theme.palette.secondary.light,
  },
}));

const DecisionUndoBar = (props) => {
  const theme = useTheme();
  const classes = useStyles(theme);

    const handleClose = (event, reason) => {
      props.close()
    };
  
    const handleUndo = (event, reason) => {
       props.undo()
    };

    let anchorOrigin = {
      vertical: 'bottom',
      horizontal: 'left',
    }

    return (
      <Snackbar
          anchorOrigin={anchorOrigin}
          open={props.state.open}
          autoHideDuration={decisionUndoBarDuration}
          onClose={handleClose}
          message={props.state.message}
          action={
            <React.Fragment>
              <Button className={classes.undoButton} size="small" onClick={handleUndo}>
                UNDO
              </Button>
            </React.Fragment>
          }
          ContentProps={{
            className: classes.root
          }}     
          className={classes.snackbar}               
        />
    )  
  }
  
  export default DecisionUndoBar;
  
  