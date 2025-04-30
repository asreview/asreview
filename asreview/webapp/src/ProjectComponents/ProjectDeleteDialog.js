import React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
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
import { ProjectAPI } from "api";

const ProjectDeleteDialog = ({
  open,
  onClose,
  projectTitle,
  project_id,
  navigate_to = null,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteInput, setDeleteInput] = React.useState("");

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateDeleteProject,
    {
      onSuccess: () => {
        queryClient.invalidateQueries("fetchProjects");
        onClose();
      },
    },
  );

  const onChangeTitle = (event) => {
    if (isError) {
      reset();
    }
    setDeleteInput(event.target.value);
  };

  const cancelDelete = () => {
    onClose();
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={cancelDelete}
      scroll="paper"
      fullWidth
      maxWidth="sm"
      TransitionProps={{
        onExited: () => {
          if (navigate_to) {
            navigate(navigate_to);
          }
        },
      }}
      disableRestoreFocus // bug https://github.com/mui/material-ui/issues/33004
    >
      <DialogTitle>Permanently delete this project?</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {isError && <Alert severity="error">{error["message"]}</Alert>}
          <Stack spacing={2}>
            <Alert severity="error">
              This action cannot be undone. This will permanently delete the{" "}
              <b>{projectTitle}</b> project, including the dataset, review
              labels, notes, and model configuration
            </Alert>
            <Typography>
              Please type <b>{projectTitle}</b> to confirm
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
          onClick={() => mutate({ project_id: project_id })}
          disabled={deleteInput !== projectTitle || isLoading}
        >
          Delete Forever
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDeleteDialog;
