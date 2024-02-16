import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TeamAPI } from "../../api";
import useAuth from "../../hooks/useAuth";
import { Box, Button, Stack } from "@mui/material";
import { InlineErrorHandler } from "../../Components";
import { ConfirmationDialog } from ".";

const EndCollaboration = (props) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { project_id } = useParams();
  const [errorMessage, setErrorMessage] = React.useState(undefined);

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
          <h2>You are collaborating in this project</h2>
          <p>
            If you would like to end this collaboration, please click on the
            button below:
          </p>
          <Button
            variant="contained"
            color="error"
            onClick={handleOpenConfirmationDialog}
          >
            Remove me from this Team
          </Button>
          {errorMessage !== undefined && (
            <Stack sx={{ padding: 5 }}>
              <InlineErrorHandler message={errorMessage} />
            </Stack>
          )}
        </Box>
      </Box>

      <ConfirmationDialog
        open={dialogOpen}
        title={`Removal from project "${project_id}"`}
        contents={
          "Are you sure? You will remove yourself from this project if you click on the 'Remove' button."
        }
        handleCancel={handleCloseConfirmationDialog}
        handleConfirm={handleEndCollaboration}
      />
    </>
  );
};

export default EndCollaboration;
