import { Box, Button, Stack, Typography } from "@mui/material";
import { InlineErrorHandler } from "Components";
import { ConfirmationDialog } from "ProjectComponents/TeamComponents";
import { TeamAPI, AuthAPI } from "api";
import { useToggle } from "hooks/useToggle";
import * as React from "react";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";

const CollaborationPage = () => {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, toggleDialogOpen] = useToggle();
  const [errorMessage, setErrorMessage] = React.useState(undefined);

  const { data } = useQuery("refresh", AuthAPI.refresh);

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
    <Box className="main-page-body-wrapper">
      {data?.id && (
        <Stack className="main-page-body">
          <Typography variant="h5">
            You are collaborating in this project
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={toggleDialogOpen}
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
            handleCancel={toggleDialogOpen}
            handleConfirm={() => handleEndCollaboration.mutate()}
          />
        </Stack>
      )}
    </Box>
  );
};
export default CollaborationPage;
