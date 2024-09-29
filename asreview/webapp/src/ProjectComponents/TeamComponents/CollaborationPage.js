import { Box, Button, Stack, Typography } from "@mui/material";
import { InlineErrorHandler } from "Components";
import { ConfirmationDialog } from "ProjectComponents/TeamComponents";
import { TeamAPI } from "api";
import useAuth from "hooks/useAuth";
import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

const CollaborationPage = () => {
  const { project_id } = useParams();

  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState(undefined);
  const handleOpenConfirmationDialog = () => {
    setDialogOpen(true);
  };
  const handleCloseConfirmationDialog = () => {
    setDialogOpen(false);
  };
  const handleEndCollaboration = useMutation(
    () =>
      TeamAPI.deleteCollaboration({
        projectId: project_id,
        userId: auth.id,
      }),
    {
      onSuccess: (response, project) => {
        queryClient.invalidateQueries({
          queryKey: ["fetchProjects"],
        });
        navigate("/");
      },
      onError: (error) => {
        let message = `Could not end the collaboration: (${error})`;
        setErrorMessage(message);
      },
    },
  );

  return (
    <Box className="main-page-body-wrapper">
      <Stack className="main-page-body">
        <Typography variant="h5">
          You are collaborating in this project
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleOpenConfirmationDialog}
          sx={{ width: 300 }}
        >
          Remove me from this project
        </Button>
        {errorMessage !== undefined && (
          <Stack sx={{ padding: 5 }}>
            <InlineErrorHandler message={errorMessage} />
          </Stack>
        )}
        <ConfirmationDialog
          open={dialogOpen}
          title="Are you sure?"
          contentText={`You will remove yourself from this project.`}
          handleCancel={handleCloseConfirmationDialog}
          handleConfirm={() => handleEndCollaboration.mutate()}
        />
      </Stack>
    </Box>
  );
};
export default CollaborationPage;
