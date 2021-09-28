import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ProjectAPI } from "./api/index.js";

const PREFIX = "ProjectSettings";

const classes = {
  root: `${PREFIX}-root`,
  deleteButton: `${PREFIX}-deleteButton`,
  header: `${PREFIX}-header`,
  inputDelete: `${PREFIX}-inputDelete`,
};

const StyledDialog = styled(Dialog)({
  [`& .${classes.root}`]: {
    maxWidth: "100%",
  },
  [`& .${classes.deleteButton}`]: {
    margin: 5,
  },
  [`& .${classes.header}`]: {
    marginBottom: 10,
  },
  [`& .${classes.inputDelete}`]: {
    marginBottom: 10,
    marginTop: 10,
  },
});

export default function ProjectSettings(props) {
  // set the styles

  // state variables
  const [deleteInput, setDeleteInput] = React.useState("");

  // useeffect
  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (props.settings) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.settings]);

  const deleteProject = (evt) => {
    evt.preventDefault();

    if (deleteInput === props.id) {
      ProjectAPI.delete(props.id)
        .then((result) => {
          props.handleAppState("projects");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onChange = (evt) => {
    setDeleteInput(evt.target.value);
  };

  return (
    <StyledDialog
      open={props.settings}
      onClose={props.toggleProjectDelete}
      scroll="paper"
      fullWidth={true}
      maxWidth={"sm"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="delete-project-title">
        Delete project '{props.id}'?
      </DialogTitle>
      <DialogContent dividers={true}>
        <Typography>
          Delete your project by typing the project name '{props.id}' below.
        </Typography>
        <TextField
          className={classes.inputDelete}
          fullWidth
          required
          name="project-name"
          id="project-name"
          label="Project name"
          onChange={onChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.toggleProjectDelete}>Cancel</Button>
        <Button onClick={deleteProject} disabled={deleteInput !== props.id}>
          Yes, Delete project
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
