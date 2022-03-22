import React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  TextField,
} from "@mui/material";

import { ProjectAPI } from "../api/index.js";

const ProjectDeleteDialog = (props) => {
  const navigate = useNavigate();
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const descriptionElementRef = React.useRef(null);
  const [deleteInput, setDeleteInput] = React.useState("");

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateDeleteProject,
    {
      onSuccess: () => {
        if (!project_id) {
          queryClient.invalidateQueries("fetchProjects");
          queryClient.invalidateQueries("fetchDashboardStats");
          props.toggleDeleteDialog();
        } else {
          navigate("/projects");
        }
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
      <DialogTitle>Permanently delete this project?</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {isError && <Alert severity="error">{error["message"]}</Alert>}
          <Stack spacing={2}>
            <Typography>
              This action <b>cannot</b> be undone. This will permanently delete
              the <b>{props.projectTitle}</b> project, including the dataset,
              review history, notes, and model configuration.
            </Typography>
            <Typography>
              Please type <b>{props.projectTitle}</b> to confirm.
            </Typography>
          </Stack>
          <TextField
            autoComplete="off"
            autoFocus
            fullWidth
            required
            name="project-title"
            id="project-title"
            label="Title"
            onChange={onChangeTitle}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelDelete}>Cancel</Button>
        <Button
          onClick={() => mutate({ project_id: props.project_id })}
          disabled={disableConfirmButton()}
        >
          Delete Forever
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDeleteDialog;
