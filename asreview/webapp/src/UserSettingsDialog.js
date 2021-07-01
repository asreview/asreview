import React from "react";
import {
  Button,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Select,
  MenuItem,
} from "@material-ui/core";

import LoginForm from "./Components/LoginForm";
import { UsersAPI } from "./api/index.js";
//import LoginForm2 from "./Components/LoginForm2";

export default function UserSettingsDialog(props) {
  const [open, setOpen] = React.useState(false);
  const descriptionElementRef = React.useRef(null);

  React.useEffect(() => {
    if (props.openUserSettings) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.openUserSettings]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={props.openUserSettings}
        onClose={props.handleClose}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Users settings</DialogTitle>
        <DialogContent dividers={true}>
          {/*
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
          */}

          {/*
            "Add tabs for different types of settings"
            <Tabs
              value={0}
              indicatorColor="primary"
              textColor="primary"
              aria-label="disabled tabs example"
            >
              <Tab label="Interface" />
              <Tab label="Algorithms" disabled/>
            </Tabs>
          */}

          <List>
            <ListItem>
              <LoginForm
                open={open}
                onClose={handleClose}
                isAuthenticated={UsersAPI.isAuthenticated}
                handleLoginFormSubmit={UsersAPI.handleLoginFormSubmit} />
            </ListItem>
            <ListItem>
              <ListItemText id="switch-list-label-dark" primary="Add a new user" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText id="switch-list-label-dark" primary="List of users" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
