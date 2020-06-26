import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
      backgroundColor: "#FFF7DB",
      color: "#232323"
  },
});

const DecisionUndoBar = (props) => {
    const classes = useStyles();

    const handleClose = (event, reason) => {
      props.close()
    };
  
    const handleUndo = (event, reason) => {
       props.undo()
    };

    return (
      <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={props.state.open}
          autoHideDuration={10000}
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
  
  