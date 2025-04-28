import { Button, Stack, Alert } from "@mui/material";
import { InlineErrorHandler } from "Components";
import { ConfirmationDialog } from "ProjectComponents/TeamComponents";
import { AuthAPI, TeamAPI } from "api";
import { useToggle } from "hooks/useToggle";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

const CollaborationPage = () => {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, toggleDialogOpen] = useToggle();
  const [errorMessage, setErrorMessage] = React.useState(undefined);

  const { data } = useQuery("user", AuthAPI.user);

  const handleEndCollaboration = useMutation(
    () =>
      TeamAPI.deleteCollaboration({
        projectId: project_id,
        userId: data.id,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["fetchProjects"] });
        navigate("/reviews");
      },
      onError: (error) => {
        setErrorMessage(`Could not end the collaboration: (${error})`);
      },
    },
  );

  return (
    <>
      {data?.id && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Alert severity="info" sx={{ flexGrow: 1 }}>
              You are collaborating in this project
            </Alert>
            <Button
              variant="contained"
              color="error"
              onClick={toggleDialogOpen}
            >
              Remove me from the project
            </Button>
          </Stack>

          {errorMessage !== undefined && (
            <Stack sx={{ padding: 5 }}>
              <InlineErrorHandler message={errorMessage} />
            </Stack>
          )}
          <ConfirmationDialog
            open={dialogOpen}
            title="Are you sure?"
            contentText={
              <React.Fragment>
                This will remove you from this project
                <Alert severity="info" sx={{ mt: 2 }}>
                  Your labels will still be available for the project owner
                </Alert>
              </React.Fragment>
            }
            handleCancel={toggleDialogOpen}
            handleConfirm={() => handleEndCollaboration.mutate()}
          />
        </Stack>
      )}
    </>
  );
};
export default CollaborationPage;
