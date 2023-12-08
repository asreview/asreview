import * as React from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Add, Upload } from "@mui/icons-material";

import { InlineErrorHandler } from "../../Components";
import { SelectItem } from "../../ProjectComponents";
import { projectModes } from "../../globals";

const PREFIX = "ModePickDialog";

const classes = {
  avatar: `${PREFIX}-avatar`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.avatar}`]: {
    backgroundColor: [
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    ],
  },
}));

const modes = [
  {
    value: projectModes.ORACLE,
    primary: "Oracle",
    secondary:
      "Review your dataset with interactive artificial intelligence (AI)",
  },
  {
    value: projectModes.EXPLORATION,
    primary: "Validation",
    secondary:
      "Validate labels provided by another screener or derived from a LLM, and explore benchmark datasets",
  },
  {
    value: projectModes.SIMULATION,
    primary: "Simulation",
    secondary:
      "Simulate a review on a completely labeled dataset to see the performance of ASReview LAB",
  },
  {
    value: "import",
    primary: "Import",
    secondary: "Import an existing project",
  },
];

export default function ModePickDialog(props) {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose(null);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <StyledDialog
      maxWidth="md"
      onClose={handleClose}
      open={open}
      TransitionProps={{
        onExited: () => {
          props.reset(); // reset the error of init project
        },
      }}
    >
      <DialogTitle>Create project</DialogTitle>
      {props.isError && <InlineErrorHandler message={props.error?.message} />}
      <List sx={{ pt: 0 }}>
        {modes.map((mode) => (
          <ListItem
            button
            onClick={() => handleListItemClick(mode.value)}
            key={mode.value}
          >
            <ListItemAvatar>
              <Avatar className={classes.avatar}>
                {mode.value !== "import" ? (
                  <Add color="primary" />
                ) : (
                  <Upload color="primary" />
                )}
              </Avatar>
            </ListItemAvatar>
            <SelectItem primary={mode.primary} secondary={mode.secondary} />
          </ListItem>
        ))}
      </List>
    </StyledDialog>
  );
}

ModePickDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
