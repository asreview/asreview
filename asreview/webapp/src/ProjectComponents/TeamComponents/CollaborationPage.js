import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import { AuthAPI, TeamAPI } from "api";
import { InlineErrorHandler } from "Components";
import { useToggle } from "hooks/useToggle";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

const CollaborationPage = ({ project_id }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, toggleDialogOpen] = useToggle();

  const { data } = useQuery("user", AuthAPI.user);
  const { mutate, isError } = useMutation(TeamAPI.deleteCollaboration, {
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchProjects"]);
      navigate("/reviews");
    },
  });

  return (
    <Box sx={{ padding: 2 }}>
      {data?.id && (
        <>
          <Button variant="contained" color="error" onClick={toggleDialogOpen}>
            Remove me from this project
          </Button>

          {isError && (
            <Stack sx={{ padding: 5 }}>
              <InlineErrorHandler message="Could not end the collaboration" />
            </Stack>
          )}

          <Dialog
            open={dialogOpen}
            onClose={toggleDialogOpen}
            aria-labelledby="confirm-end-collab-dialog-title"
            aria-describedby="confirm-end-collab-dialog-description"
          >
            <DialogTitle id="confirm-end-collab-dialog-title">
              Remove yourself from the project?
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="confirm-end-collab-dialog-description">
                <React.Fragment>
                  This will remove you from this project
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Your labels will still be available for the project owner
                  </Alert>
                </React.Fragment>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={toggleDialogOpen}>Cancel</Button>
              <Button
                onClick={() =>
                  mutate({ projectId: project_id, userId: data.id })
                }
                autoFocus
              >
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default CollaborationPage;
