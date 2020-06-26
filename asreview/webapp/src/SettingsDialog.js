import React from 'react';
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
} from '@material-ui/core';

export default function SettingsDialog(props) {

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
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
              <ListItemText id="switch-list-label-dark" primary="Dark Mode" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={props.authors}
                  checked={props.onDark.palette.type === "dark"}
                  inputProps={{ 'aria-labelledby': 'switch-list-label-dark' }}
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
                    <MenuItem value='Smallest'>Smallest</MenuItem>
                    <MenuItem value='Small'>Small</MenuItem>
                    <MenuItem value='Normal'>Normal</MenuItem>
                    <MenuItem value='Large'>Large</MenuItem>
                    <MenuItem value='Largest'>Largest</MenuItem>
                  </Select>
                </FormControl>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText id="switch-list-label-undo" primary="Undo Enabled" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={props.toggleUndoEnabled}
                  checked={props.undoEnabled}
                  inputProps={{ 'aria-labelledby': 'switch-list-label-undo' }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>

        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
