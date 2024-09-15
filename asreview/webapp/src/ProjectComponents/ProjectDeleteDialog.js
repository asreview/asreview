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

const ProjectDeleteDialog = ({ open, onClose, projectTitle, project_id }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const descriptionElementRef = React.useRef(null);
  const [deleteInput, setDeleteInput] = React.useState("");

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateDeleteProject,
    {
      onSuccess: () => {
        if (!project_id) {
          queryClient.invalidateQueries("fetchProjects");
          onClose();
        } else {
          navigate("/reviews");
        }
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

  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <Dialog
      open={open}
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
              the <b>{projectTitle}</b> project , including the dataset, review
              labels, notes, and model configuration.
            </Typography>
            <Typography>
              Please type <b>{projectTitle}</b> to confirm.
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
