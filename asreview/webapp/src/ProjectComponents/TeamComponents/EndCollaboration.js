import * as React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { TeamAPI, ProjectAPI } from "api";
import useAuth from "hooks/useAuth";
import { Box, Button, Stack, Typography } from "@mui/material";
import { InlineErrorHandler } from "Components";
import { ConfirmationDialog } from "ProjectComponents/TeamComponents";

const EndCollaboration = (props) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { auth } = useAuth();
  const { project_id } = useParams();
  const [errorMessage, setErrorMessage] = React.useState(undefined);
  const [projectName, setProjectName] = React.useState(undefined);

  const {
    isSuccess: success,
  } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: project_id !== null,
      onSuccess: (data) => {
        setProjectName(data["name"]);
      },
      refetchOnWindowFocus: false,
    },
  );

  const handleOpenConfirmationDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setDialogOpen(false);
  };

  const handleEndCollaboration = () => {
    setDialogOpen(false);
    TeamAPI.endCollaboration(project_id, auth.id)
      .then((data) => {
        if (data.success) {
          navigate("/projects");
        } else {
          let message = "Could not end the collaboration -- DB failure";
          console.error(message);
          setErrorMessage(message);
        }
      })
      .catch((err) => {
        let message = `Could not end the collaboration: ${err.message} (${err.code})`;
        console.error("Could not invite user", err);
        setErrorMessage(message);
      });
  };

  return (
    <>
      <Box>
        <Box>
          <Typography variant="h5">You are collaborating in this project</Typography>
          { success && (
            <>
              <Typography sx={{ paddingTop: 3, paddingBottom: 3}}>
                If you would like to end this collaboration, please click on the
                button below:
              </Typography>

              <Button
                variant="contained"
                color="error"
                onClick={handleOpenConfirmationDialog}
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
                title={`Removal from project "${projectName}"`}
                contents={
                  "Are you sure? You will remove yourself from this project if you click on the 'Remove' button."
                }
                handleCancel={handleCloseConfirmationDialog}
                handleConfirm={handleEndCollaboration}
              />
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EndCollaboration;
