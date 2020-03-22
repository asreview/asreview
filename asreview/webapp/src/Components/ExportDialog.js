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

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ExitDialog = (props) => {

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
        <DialogTitle id="scroll-dialog-title">Export results {props.project_id}</DialogTitle>
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

export default connect(mapStateToProps)(ExitDialog)
