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

import { Route } from "react-router-dom";
import { Switch as RouterSwitch } from "react-router-dom";
import LoginForm from "./Components/LoginForm";
import LoginForm2 from "./Components/LoginForm2";
import axios from "axios";

// auth users
import { UsersAPI } from "./api/index.js";

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
              <ListItemText id="switch-list-label-dark" primary="Login" />
              {<LoginForm2 open={open} onClose={handleClose} />}
              {/* {<ListItemSecondaryAction>
                <RouterSwitch>
                  <Route
                    exact
                    path="/login"
                    render={() => (
                      <LoginForm
                        // eslint-disable-next-line react/jsx-handler-names
                        handleLoginFormSubmit={props.UsersAPI.handleLoginFormSubmit}
                        isAuthenticated={props.UsersAPI.isAuthenticated}
                      />
                    )}
                  />
                </RouterSwitch>
                    </ListItemSecondaryAction>} */}
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
