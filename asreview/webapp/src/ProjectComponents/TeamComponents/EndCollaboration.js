import * as React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { TeamAPI } from "../../api/index.js";
import useAuth from "../../hooks/useAuth";
import { Box, Button, Stack } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { InlineErrorHandler } from "../../Components";



const EndCollaboration = (props) => {

  const [open, setOpen] = React.useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { project_id } = useParams();
  const [errorMessage, setErrorMessage] = React.useState(undefined);

  const handleClickOpenAlert = () => {
    setOpen(true);
  };

  const handleCloseAlert = () => {
    setOpen(false);
  };

  const handleEndCollaboration = () => {
    setOpen(false);
    TeamAPI.endCollaboration(project_id, auth.id)
      .then(data => {
        if (data.success) {
          navigate("/projects")
        } else {
          let message = "Could not end the collaboration -- DB failure"
          console.error(message);
          setErrorMessage(message)
        }
      })
      .catch(err => {
        let message = `Could not end the collaboration: ${err.message} (${err.code})`
        console.error("Could not invite user", err);
        setErrorMessage(message)
      });
  }

  return (
    <>
      <Box>
        <Box>
          <h2>You are collaborating in this project</h2>
          <p>If you would like to end this collaboration, please click on the button below:</p>
          <Button
            variant="contained"
            color="error"
            onClick={handleClickOpenAlert}
          >
            Remove me from this Team
          </Button>
          {(errorMessage !== undefined) && 
            <Stack sx={{padding: 5}}>
              <InlineErrorHandler 
                message={errorMessage}
              />
            </Stack>
          }
        </Box>
      </Box>

      <Dialog
          open={open}
          onClose={handleCloseAlert}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Removal from team" + project_id}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure? You will remove yourself from this project if you 
              click on the 'Remove' button.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAlert}>Cancel</Button>
            <Button onClick={handleEndCollaboration} autoFocus>
              Remove
            </Button>
          </DialogActions>
        </Dialog>
    </>
  )
}

export default EndCollaboration;