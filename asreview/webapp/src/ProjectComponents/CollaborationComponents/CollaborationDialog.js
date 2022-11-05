import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { blue } from '@mui/material/colors';

import { useQuery } from "react-query";
import { CollaborationAPI } from "../../api/index.js";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Divider,
  Fab,
  Fade,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from "@mui/material/styles";
import { Close, ResetTv } from "@mui/icons-material";


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

  const handleClose = () => {
    props.toggleCollaboDialog();
  };

  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
    ["fetchCollaborators", props.project_id],
    () => CollaborationAPI.fetchCollaborators(props.project_id),
    {
      onSuccess: (data) => {
        console.log('succes', data);
      },
      onError: (data) => {
        console.log('error', data);
      }
    }
  );

  const inviteUser = () => {
    console.log(selectedUser)
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
      !isError &&
      !isFetching &&
      isFetched &&
      isSuccess &&
      data.potential_collaborators &&
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
          options={data.potential_collaborators.map(user => ({id: user.id, label: user.full_name}))}
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
        <ul>{ data.invited_users.map(user => <li>user.full_name</li> )}</ul>

        <h2>Collaborators</h2>
        <ul>{ data.collaborators.map(user => <li>{user.full_name}</li> )}</ul>

      </>
    }
    </StyledDialog>
  );
}

export default CollaborationDialog;


