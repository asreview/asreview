import React, { useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
} from "@material-ui/core";
import { useTheme } from '@material-ui/core/styles';

export default function SettingsDialog(props) {

  const descriptionElementRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (props.openSettings) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.openSettings]);

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={props.openSettings}
        onClose={props.handleClose}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Settings</DialogTitle>
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
              <ListItemText id="switch-list-label-dark" primary="Dark mode"/>
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={props.toggleDarkMode}
                  checked={props.onDark.palette.type === "dark"}
                  inputProps={{ "aria-labelledby": "switch-list-label-dark" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText id="change-text-size" primary="Text size" />
              <ListItemSecondaryAction>
                <FormControl>
                  <Select
                    id="change-text-size-select"
                    value={props.textSize}
                    onChange={props.handleTextSizeChange}
                  >
                    <MenuItem value="smallest">Smallest</MenuItem>
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                    <MenuItem value="largest">Largest</MenuItem>
                  </Select>
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText id="switch-list-label-undo" primary="Undo" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={props.toggleUndoEnabled}
                  checked={props.undoEnabled}
                  inputProps={{ "aria-labelledby": "switch-list-label-undo" }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                id="switch-list-label-key"
                primary="Keyboard shortcuts"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={props.toggleKeyPressEnabled}
                  checked={props.keyPressEnabled}
                  inputProps={{ "aria-labelledby": "switch-list-label-key" }}
                />
              </ListItemSecondaryAction>
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
