import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles, useTheme } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
      backgroundColor: theme.palette.info[50],
      color: theme.palette.primary.main,
      marginTop: 56,
      marginBottom: 56,
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

    const isBigScreen = window.innerWidth > theme.breakpoints.width('md')
    let anchorOrigin = {
      vertical: isBigScreen ? 'bottom' : 'top',
      horizontal: isBigScreen ? 'left' : 'center',
    }

    return (
      <Snackbar
          anchorOrigin={anchorOrigin}
          open={props.state.open}
          autoHideDuration={6000}
          onClose={handleClose}
          message={props.state.message}
          action={
            <React.Fragment>
              <Button color="secondary" size="small" onClick={handleUndo}>
                UNDO
              </Button>
            </React.Fragment>
          }
          ContentProps={{
            className: classes.root
          }}          
        />
    )  
  }
  
  export default DecisionUndoBar;
  
  