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
  Fade,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close, ResetTv } from "@mui/icons-material";

const emails = ['username@gmail.com', 'user02@gmail.com'];

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

const CollaboDialog = (props) => {

  const handleClose = () => {
    //onClose(selectedValue);
    props.toggleCollaboDialog();
  };

  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
    ["fetchPotentialCollaborators", "je;;p"],
    CollaborationAPI.fetchPotentialCollaborators,
    {
      onSuccess: (data) => {
        console.log('succes', data);
      },
      onError: (data) => {
        console.log('error', data);
      }

    }
  );


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

    <List sx={{ pt: 0 }}>

      {!isError &&
        !isFetching &&
        isFetched &&
        isSuccess &&
        data.result
          .map((user) => {
            return (

        <ListItem button onClick={() => handleListItemClick(user.email)} key={user.email}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={user.full_name} />
        </ListItem>

        )})
      }
    </List>

    </StyledDialog>
  );
}

export default CollaboDialog;


