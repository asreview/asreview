import React from "react";
import { useMutation, useQueryClient } from "react-query";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ProjectAPI } from "api";

const ProjectRenameDialog = ({ open, onClose, projectTitle, project_id }) => {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = React.useState(projectTitle);

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateInfo,
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
    setNewTitle(event.target.value);
  };

  const cancelRename = () => {
    onClose();
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={cancelRename}
      scroll="paper"
      fullWidth
      maxWidth="sm"
      disableRestoreFocus
    >
      <DialogTitle>Rename project</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {isError && <Alert severity="error">{error["message"]}</Alert>}
          <Stack spacing={2}>
            <Typography>
              Please enter a new name for the <b>{projectTitle}</b> project.
            </Typography>
          </Stack>
          <TextField
            autoComplete="off"
            autoFocus
            fullWidth
            required
            name="project-name"
            id="project-name"
            label="New project name"
            value={newTitle}
            onChange={onChangeTitle}
            disabled={isLoading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelRename}>Cancel</Button>
        <Button
          onClick={() => mutate({ project_id: project_id, title: newTitle })}
          disabled={isLoading}
        >
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectRenameDialog;
