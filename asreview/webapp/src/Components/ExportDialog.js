import React from 'react';
import {
  Tab,
  Tabs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch
} from '@material-ui/core';

export default function ExitDialog(props) {

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.exportResult) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.exportResult]);

  return (
      <Dialog
        open={props.exportResult}
        onClose={props.toggleExportResult}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Export results</DialogTitle>
          <DialogContent dividers={true}>
            <Typography>We are working on this.</Typography>
          </DialogContent> 
  
        <DialogActions>
          <Button onClick={props.toggleExportResult} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
}