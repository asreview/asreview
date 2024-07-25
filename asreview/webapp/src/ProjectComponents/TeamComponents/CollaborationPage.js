import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { TeamAPI } from "api";
import useAuth from "hooks/useAuth";
import { Box, Button, Fade, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { InlineErrorHandler, PageHeader } from "Components";
import { ConfirmationDialog } from "ProjectComponents/TeamComponents";

const Root = styled("div")(({ theme }) => ({}));

const CollaborationPage = (props) => {
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
        projectId: props.info.id,
        userId: auth.id,
      }),
    {
      onSuccess: (response, project) => {
        queryClient.invalidateQueries({
          queryKey: ["fetchProjects", props.info.mode],
        });
        navigate("/projects");
      },
      onError: (error) => {
        let message = `Could not end the collaboration: (${error})`;
        setErrorMessage(message);
      },
    },
  );

  return (
    <Root aria-label="teams page">
      <Fade in>
        <Box>
          <PageHeader header="Team" />

          <Box className="main-page-body-wrapper">
            <Stack className="main-page-body">
              <Typography variant="h5">
                You are collaborating in this project
              </Typography>
              {props.info && (
                <>
                  <Typography sx={{ paddingTop: 3, paddingBottom: 3 }}>
                    If you would like to end this collaboration, click on the
                    button below:
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
                    contentText={`You will remove yourself from project "${props.info.name}".`}
                    handleCancel={handleCloseConfirmationDialog}
                    handleConfirm={() => handleEndCollaboration.mutate()}
                  />
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Root>
  );
};

export default CollaborationPage;
