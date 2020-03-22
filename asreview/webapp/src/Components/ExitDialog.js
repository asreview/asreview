import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core';

export default function ExitDialog(props) {

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.exit) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.exit]);

  return (
      <Dialog
        open={props.exit}
        onClose={props.toggleExit}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Exit ASReview</DialogTitle>
        {window.location.hostname === "localhost" &&
          <DialogContent dividers={true}>
            <Typography>Close your browser window.</Typography>
            <br/>
            <Typography>For a complete shutdown, please close your terminal or CMD.exe as well (CTRL+C).</Typography>
          </DialogContent> 
          }
          {window.location.hostname !== "localhost" &&
            <Typography>Just close the window</Typography>
          }          
          
  
        <DialogActions>
          <Button onClick={props.toggleExit} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
}