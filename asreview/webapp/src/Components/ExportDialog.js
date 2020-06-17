import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';

// import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";
import store from '../redux/store'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    width: "100%",
  },
  button: {
    marginTop: "16px",
  }
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ExportDialog = (props) => {

  const classes = useStyles();

  const [exportFileType, setExportFileType] = React.useState('excel');

  const handleExportFileTypeChange = (event) => {
    setExportFileType(event.target.value);
  };

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

      // download URL, example http://localhost:5000/api/project/myproject/export?file_type=excel
      const exportUrl = api_url + `project/${project_id}/export?file_type=${exportFileType}`

      setTimeout(() => {
        const response = {
          file: exportUrl,
        };
        window.location.href = response.file;
      }, 100);

    } else{
      // raise exception
    }

  }

  const downloadProject = () => {

    const project_id = store.getState()["project_id"]

    if (project_id !== null){

      // download URL, example http://localhost:5000/api/project/myproject/export_project
      const exportUrl = api_url + `project/${project_id}/export_project`

      setTimeout(() => {
        const response = {
          file: exportUrl,
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
        <DialogTitle id="scroll-dialog-title">Export results/project {props.project_id}</DialogTitle>
          <DialogContent dividers={true}>
            <Typography>
              Download the result of your review (Excel or CSV file).
            </Typography>

            <FormControl className={classes.formControl}>
              <InputLabel id="select-export-file-type-label">File type</InputLabel>
              <Select
                labelId="select-export-file-type-label"
                id="select-export-file-type"
                value={exportFileType}
                onChange={handleExportFileTypeChange}
              >
                <MenuItem value={"excel"}>Excel</MenuItem>
                <MenuItem value={"csv"}>CSV (UTF-8)</MenuItem>
              </Select>

            </FormControl>
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={downloadResult}
            >
              Export
            </Button>
          </DialogContent>

          <DialogContent dividers={true}>
            <Typography>
              Download your project (ZIP file).
            </Typography>

            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={downloadProject}
            >
              Export
            </Button>
          </DialogContent>

        <DialogActions>
          <Button
            onClick={props.toggleExportResult}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default connect(mapStateToProps)(ExportDialog)
