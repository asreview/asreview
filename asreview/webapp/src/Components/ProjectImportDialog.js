import React, { useEffect, useRef, useState } from "react";
import { useIsFetching, useMutation } from "react-query";
import { connect } from "react-redux";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Alert, AlertTitle } from "@material-ui/lab";

import { ProjectAPI } from "../api/index.js";
import { mapStateToProps, mapDispatchToProps } from "../globals.js";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: "16px",
  },
  dialog: {
    width: "100%",
  },
  input: {
    marginTop: "16px",
  },
  uploadButton: {
    marginTop: "26px",
  },
  link: {
    paddingLeft: "3px",
  },
}));

const ProjectImportDialog = (props) => {
  const classes = useStyles();

  const descriptionElementRef = useRef(null);
  const [file, setFile] = useState(null);

  // import a project
  const { data, error, isLoading, mutate } = useMutation(
    ProjectAPI.mutateImportProject,
    {
      onSettled: () => {
        setFile(null);
      },
    }
  );

  // if imported project is being converted
  const isConverting = useIsFetching(["fetchConvertProjectIfOld"]);

  // state while importing or converting
  const isLoadingConverting = () => {
    return isLoading || isConverting !== 0;
  };

  // selected project file
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // set project id once imported
  useEffect(() => {
    if (data) {
      props.setProjectId(data["id"]);
    }
  });

  useEffect(() => {
    if (props.open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.open]);

  return (
    <Dialog
      open={props.open}
      onClose={isLoadingConverting() ? null : props.onClose}
      scroll="body"
      fullWidth={true}
      maxWidth={"sm"}
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
            onChange={handleFileChange}
          />
        </div>

        <div className={classes.root}>
          {file === null && error && (
            <Alert severity="error">
              <AlertTitle>{error["message"]}</AlertTitle>
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
        <Button
          onClick={props.onClose}
          color="primary"
          disabled={isLoadingConverting()}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            mutate({ file });
          }}
          color="primary"
          disabled={file === null || isLoadingConverting()}
        >
          {isLoadingConverting() ? "Importing..." : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectImportDialog);
