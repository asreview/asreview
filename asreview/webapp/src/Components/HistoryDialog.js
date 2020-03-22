import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';

export default function SettingsDialog(props) {

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.openHistory) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.openHistory]);

  return (
      <Dialog
        open={props.openHistory}
        onClose={props.handleHistoryClose}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Decision History</DialogTitle>
        <DialogContent dividers={true}>
          We are working on this. 
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleHistoryClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
}