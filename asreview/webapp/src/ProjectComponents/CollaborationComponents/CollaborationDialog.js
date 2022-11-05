import * as React from 'react';

import List from '@mui/material/List';
import { useQuery } from "react-query";
import { CollaborationAPI } from "../../api/index.js";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";
import {
  DialogTitle,
  Dialog,
  Divider,
  Fab,
  Fade,
  Stack,
  Tooltip,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from "@mui/material/styles";
import { Close } from "@mui/icons-material";
import UserListEntry from "./UserListEntry";


const PREFIX = "SetupDialog";

const classes = {
  content: `${PREFIX}-content`,
  stepper: `${PREFIX}-stepper`,
  form: `${PREFIX}-form`,
  formWarmup: `${PREFIX}-form-warmup`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.content}`]: {
    paddingLeft: 0,
    paddingRight: 0,
    overflowY: "hidden",
  },

  [`& .${classes.stepper}`]: {
    padding: 8,
  },

  [`& .${classes.form}`]: {
    height: "calc(100% - 60px)",
    overflowY: "scroll",
    padding: "32px 48px 48px 48px",
  },

  [`& .${classes.formWarmup}`]: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
}));

const CollaborationDialog = (props) => {

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [potentialCollaborators, setPotentialCollaborators] = React.useState([]);
  const [collaborators, setCollaborators] = React.useState([]);
  const [pendingCollaborators, setPendingCollaborators] = React.useState([]);

  const handleClose = () => {
    props.toggleCollaboDialog();
  };

  useQuery(
    ["fetchCollaborators", props.project_id],
    () => CollaborationAPI.fetchCollaborators(props.project_id),
    {
      onSuccess: (data) => {
        setPotentialCollaborators(data.potential_collaborators || []);
        setCollaborators(data.collaborators || []);
        setPendingCollaborators(data.invited_users || []);
      },
      onError: (data) => {
        console.log('error', data);
      }
    }
  );

  const inviteUser = () => {
    if (selectedUser) {
      // remove from potential collabos
      console.log(selectedUser);
      // and add to pending invites
      setPendingCollaborators((state) => 
        [...state, selectedUser]);
      // set selected value to null
      setSelectedUser(null);
    }
  }

  const handleListItemClick = (value) => {
    //onClose(value);
    console.log('clicked')
  };

  return (
    <StyledDialog
      aria-label="collaboration setup"
      open={props.openCollaboDialog}
      fullScreen={props.mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
    >
    <Fade in={true}>
      <Stack className="dialog-header" direction="row">
        <DialogTitle>Collaborators</DialogTitle>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Stack
            className="dialog-header-button right"
            direction="row"
            spacing={1}
          >
            <Tooltip title="Close">
              <StyledIconButton onClick={handleClose}>
                <Close />
              </StyledIconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Fade>
    <Divider />

    { // AUTOCOMPLETE
      <>
        <h2>Invite</h2>
        <Autocomplete
          value={selectedUser}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(event, newValue=null) => {
            if (newValue !== null) {
              setSelectedUser(newValue);
            }
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={ potentialCollaborators }
          getOptionLabel={option => option.full_name }
          sx={{ width: 300, padding: 1 }}
          renderInput={(params) => <TextField {...params} label="Select a user" />}
        />
        <Fab
          className=''
          color="primary"
          onClick={inviteUser}
          variant="extended"
          sx={{ width: 120, padding: 1, margin: 2 }}
        >
          <Add sx={{ mr: 1 }} />
          Invite
        </Fab>

        <h2>Pending</h2>
        <List sx={{ pt: 0 }}>
        { pendingCollaborators.map((user) => <UserListEntry id={user.id} fullName={user.full_name} /> )}
        </List>


        <h2>Collaborators</h2>
        <List sx={{ pt: 0 }}>
        { collaborators.map((user) => <UserListEntry id={user.id} fullName={user.full_name} /> )}
        </List>

      </>
    }
    </StyledDialog>
  );
}

export default CollaborationDialog;


