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

import { api_url } from '../globals.js';


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

const ImportDialog = (props) => {

  const classes = useStyles();

  const [file, setFile] = React.useState(null);
  const [filename, setFilename] = React.useState(null);
  const [upload, setUpload] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [error, setError] = React.useState(null);

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.importProject) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.importProject]);

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
    .then(function () {

        // reset button
        setUpload(false);

        // remove accepted files
        setFile(null);

        // selected file uploaded
        setSelection(true);

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
        open={props.importProject}
        onClose={() => {
          resetAlert();
          props.toggleImportProject();
          props.handleAppState("projects");
        }}
        scroll="body"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Import projects </DialogTitle>

          <DialogContent 
            className={classes.dialog}
            dividers={true}
          >
            <Typography>
              Upload your projects (ASReview file).
            </Typography>

            <div className={classes.input}>
              <input type="file" name="fileToUpload" id="fileToUpload" onChange={onFileChange} />
            </div>

            {/* Disabled import button while no file selected */}
              <div>
                {file === null && selection === null && error === null &&
                  <Button
                    className={classes.uploadButton}
                    variant="contained"
                    color="primary"
                    disabled
                  >
                    Import
                  </Button>
                }
              </div>

            {/* Enabled import button while file selected */}
              <div>
                {file !== null &&
                  <Button
                    className={classes.uploadButton}
                    variant="contained"
                    color="primary"
                    onClick={uploadProject}
                  >
                  {upload ? "Importing..." : "Import"}
                  </Button>
                }
              </div>
            
            {/* Alert after click on import button */}
              <div className={classes.root}>
                {file === null && selection !== null &&
                  <Alert
                    severity="success"
                  >
                    Successfully uploaded the project file "{filename}".
                  </Alert>
                }
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
              onClick={() => {
                resetAlert();
                props.toggleImportProject();
                props.handleAppState("projects");
              }}
            >
              Close
            </Button>
          </DialogActions>
      </Dialog>
  );
};


export default ImportDialog;
