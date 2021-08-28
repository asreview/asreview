import React, { useState } from "react";
import { useQuery } from "react-query";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";

import { ProjectAPI } from "../api/index.js";

import { mapStateToProps } from "../globals.js";

import { connect } from "react-redux";

const ProjectConverterDialog = (props) => {
  const [convert, setConvert] = useState(false);

  const { isLoading } = useQuery(
    ["fetchProjectConverter", { project_id: props.project_id }],
    ProjectAPI.fetchProjectConverter,
    {
      enabled: convert,
      onSuccess: () => {
        props.handleAppState("project-page");
      },
      onSettled: () => {
        setConvert(false);
      },
      refetchOnWindowFocus: false,
    }
  );

  const handleCloseProjectConverter = () => {
    setConvert(false);
    props.toggleProjectConverter();
    props.handleAppState("projects");
  };

  return (
    <Dialog
      open={props.onProjectConverter}
      onClose={isLoading ? null : handleCloseProjectConverter}
    >
      <DialogContent>
        <DialogContentText>
          You are attempting to open a project that was created in an earlier
          version of ASReview LAB. This project can be opened in this version
          after conversion. Your data will remain intact.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseProjectConverter}
          color="primary"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setConvert(true);
          }}
          color="primary"
          autoFocus
          disabled={isLoading}
        >
          {!isLoading ? "Convert" : "Converting..."}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapStateToProps)(ProjectConverterDialog);
