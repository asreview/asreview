import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";

const ModePickDialog = ({ open, closeModePick, closeModePickAndOpenData }) => {
  return (
    <Dialog maxWidth="sm" onClose={closeModePick} open={open}>
      <DialogTitle>Choose type of project</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemButton
              onClick={() => {
                closeModePickAndOpenData("oracle");
              }}
            >
              <ListItemText
                primary={"Review"}
                secondary={
                  "Review with the help of time-saving Artificial Intelligence"
                }
              />
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => {
                closeModePickAndOpenData("explore");
              }}
            >
              <ListItemText
                primary={"Validation"}
                secondary={
                  "Validate labels provided by another screener or derived from an LLM or AI"
                }
              />
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => {
                closeModePickAndOpenData("simulate");
              }}
            >
              <ListItemText
                primary={"Simulation"}
                secondary={
                  "Simulate a review to evaluate the performance of ASReview LAB"
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={closeModePick}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModePickDialog;
