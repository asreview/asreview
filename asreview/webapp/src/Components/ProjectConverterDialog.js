import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
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

const ProjectConverterDialog = ({ project_id, handleAppState }) => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [convert, setConvert] = useState(false);

  // check if project is old
  const { data, isFetched } = useQuery(
    ["fetchProjectIsOld", { project_id }],
    ProjectAPI.fetchProjectIsOld,
    { enabled: project_id !== null, refetchOnWindowFocus: false }
  );

  // convert old project
  const { isLoading } = useQuery(
    ["fetchProjectConverter", { project_id }],
    ProjectAPI.fetchProjectConverter,
    {
      enabled: convert,
      onSuccess: () => {
        handleAppState("project-page");
      },
      onSettled: () => {
        setConvert(false);
        queryClient.invalidateQueries("fetchProjectIsOld");
      },
      refetchOnWindowFocus: false,
    }
  );

  const handleClose = () => {
    setConvert(false);
    setOpen(false);
    handleAppState("projects");
  };

  useEffect(() => {
    if (isFetched) {
      // open dialog if project needs conversion
      if (data["success"]) {
        setOpen(true);
      } else {
        handleAppState("project-page");
      }
    }
  }, [isFetched, data, handleAppState]);

  return (
    <Dialog open={open} onClose={isLoading ? null : handleClose}>
      <DialogContent>
        <DialogContentText>
          You are attempting to open a project that was created in an earlier
          version of ASReview LAB. This project can be opened in this version
          after conversion. Your data will remain intact.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={isLoading}>
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
