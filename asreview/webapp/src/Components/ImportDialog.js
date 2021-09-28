import React from "react";
import { connect } from "react-redux";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ProjectAPI } from "../api/index.js";
import { mapStateToProps } from "../globals.js";
import { setProject } from "../redux/actions";

const PREFIX = "ImportDialog";

const classes = {
  root: `${PREFIX}-root`,
  dialog: `${PREFIX}-dialog`,
  input: `${PREFIX}-input`,
  uploadButton: `${PREFIX}-uploadButton`,
  link: `${PREFIX}-link`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.root}`]: {
    width: "100%",
    marginTop: "16px",
  },

  [`& .${classes.dialog}`]: {
    width: "100%",
  },

  [`& .${classes.input}`]: {
    marginTop: "16px",
  },

  [`& .${classes.uploadButton}`]: {
    marginTop: "26px",
  },

  [`& .${classes.link}`]: {
    paddingLeft: "3px",
  },
}));

function mapDispatchToProps(dispatch) {
  return {
    setProjectId: (project_id) => {
      dispatch(setProject(project_id));
    },
  };
}

const ImportDialog = (props) => {
  const [file, setFile] = React.useState(null);
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

    ProjectAPI.import_project(data)
      .then((result) => {
        // set the project_id in the redux store
        props.setProjectId(result.data["id"]);

        // navigate to project page
        props.handleAppState("project-page");
      })
      .catch((error) => {
        // set upload to false
        setUpload(false);

        // remove accepted files
        setFile(null);

        // remove selection
        setSelection(null);

        // set error to state
        setError(error.message);
      });
  };

  return (
    <StyledDialog
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

      <DialogContent className={classes.dialog} dividers={true}>
        <Typography>
          Select an ASReview project file on your computer.
        </Typography>

        <div className={classes.input}>
          <input
            type="file"
            accept=".asreview"
            name="fileToUpload"
            id="fileToUpload"
            onChange={onFileChange}
          />
        </div>

        <div className={classes.root}>
          {file === null && error !== null && (
            <Alert severity="error">
              <AlertTitle>{error}</AlertTitle>
              <div>
                If the issue remains after retrying, click
                <Link
                  className={classes.link}
                  href="https://github.com/asreview/asreview/issues/new/choose"
                  target="_blank"
                >
                  <strong>here</strong>
                </Link>{" "}
                to report.
              </div>
            </Alert>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={uploadProject}
          color="primary"
          disabled={file === null && selection === null}
        >
          {upload ? "Importing..." : "Import"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportDialog);
