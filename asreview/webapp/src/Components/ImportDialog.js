import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import axios from 'axios';

import store from '../redux/store'
import { setProject } from '../redux/actions'

import { connect } from "react-redux";
import { api_url, mapStateToProps } from '../globals.js';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: "16px",
  },
  dialog: {
    width: '100%',
  },
  input: {
    marginTop: "16px",
  },
  uploadButton: {
    marginTop: "26px",
  },
  upload: {
  },
}));


function mapDispatchToProps(dispatch) {
    return({
        setProjectId: (project_id) => {dispatch(setProject(project_id))}
    })
}

const ImportDialog = (props) => {

  const classes = useStyles();

  const [file, setFile] = React.useState(null);
  const [filename, setFilename] = React.useState(null);
  const [upload, setUpload] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [error, setError] = React.useState(null);

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.open]);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
    setFilename(event.target.files[0].name);
  };

  const uploadProject = () => {

    // show loader
    setUpload(true);

    // remove selection
    setSelection(null);

    // set error to state
    setError(null);

    const data = new FormData();
    data.append("file", file);

    const importUrl = api_url + `project/import_project`;

    axios({
      method: 'post',
      url: importUrl,
      data: data
    })
    .then(function (response) {

        // set the project_id in the redux store
        props.setProjectId(response.data["id"])

        // navigate to project page
        props.handleAppState("project-page")

    })
    .catch(function (error) {

          // set upload to false
          setUpload(false);

          // remove accepted files
          setFile(null);

          // remove file name
          setFilename(null);

          // remove selection
          setSelection(null);

          // set error to state
          setError(error.response.data["message"]);

    });
  };

  const resetAlert = () => {
    setSelection(null);
    setError(null);
  };

  return (
      <Dialog
        open={props.open}
        onClose={props.onClose}
        scroll="body"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">
          Import ASReview project
        </DialogTitle>

          <DialogContent
            className={classes.dialog}
            dividers={true}
          >
            <Typography>
              Select an ASReview project file on your computer.
            </Typography>

            <div className={classes.input}>
              <input
                type="file"
                name="fileToUpload"
                id="fileToUpload"
                onChange={onFileChange}
              />
            </div>

            <div className={classes.root}>
              {file === null && error !== null &&
                <Alert
                  severity="error"
                >
                  {error}
                </Alert>
              }
            </div>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={props.onClose}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={uploadProject}
              color="primary"
              disabled={file === null && selection === null && error === null}
            >
              {upload ? "Importing..." : "Import"}
            </Button>
          </DialogActions>

      </Dialog>
  );
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportDialog);
