import React from "react";
import { useMutation, useQueryClient } from "react-query";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
} from "@mui/material";

import { ProjectAPI } from "../../api/index.js";

export default function ProjectDeleteDialog(props) {
  const queryClient = useQueryClient();
  const descriptionElementRef = React.useRef(null);
  const [deleteInput, setDeleteInput] = React.useState("");

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateDeleteProject,
    {
      onSuccess: () => {
        queryClient.invalidateQueries("fetchProjects");
        queryClient.invalidateQueries("fetchDashboardStats");
        props.toggleDeleteDialog();
      },
    }
  );

  const onChangeTitle = (event) => {
    if (isError) {
      reset();
    }
    setDeleteInput(event.target.value);
  };

  const cancelDelete = () => {
    props.toggleDeleteDialog();
    reset();
  };

  const disableConfirmButton = () => {
    return deleteInput !== props.projectTitle || isLoading;
  };

  React.useEffect(() => {
    if (props.onDeleteDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.onDeleteDialog]);

  return (
    <Dialog
      open={props.onDeleteDialog}
      onClose={cancelDelete}
      scroll="paper"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Delete project</DialogTitle>
      <DialogContent dividers>
        {isError && (
          <Alert severity="error" sx={{ marginBottom: "16px" }}>
            {error["message"]}
          </Alert>
        )}
        <Typography sx={{ marginBottom: "16px" }}>
          Confirm the project you want to delete by typing the title{" "}
          <b>{props.projectTitle}</b> below.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          required
          name="project-title"
          id="project-title"
          label="Title"
          onChange={onChangeTitle}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelDelete}>Cancel</Button>
        <Button
          onClick={() => mutate({ project_id: props.project_id })}
          disabled={disableConfirmButton()}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
