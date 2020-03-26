import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core';

// import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";
import store from '../redux/store'

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ExportDialog = (props) => {

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.exportResult) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.exportResult]);

  const downloadResult = () => {

    const project_id = store.getState()["project_id"]

    if (project_id !== null){

      const url = api_url + `project/${project_id}/export`;

      setTimeout(() => {
        const response = {
          file: url,
        };
        window.location.href = response.file;
      }, 100);

    } else{
      // raise exception
    }

  }

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
            <Typography>
              Download the result or your review
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={downloadResult}
            >
              Export
            </Button>
          </DialogContent> 
  
        <DialogActions>
          <Button onClick={props.toggleExportResult} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default connect(mapStateToProps)(ExportDialog)
