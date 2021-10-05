import React from "react";
import {
  FormControl,
  InputLabel,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { projectModes } from "../globals.js";

const PREFIX = "ProjectModeSelect";

const classes = {
  formControl: `${PREFIX}-formControl`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.formControl}`]: {
    width: "100%",
  },
}));

export default function ProjectModeSelect(props) {
  return (
    <Root>
      <FormControl
        variant="outlined"
        className={classes.formControl}
        disabled={props.edit}
      >
        <InputLabel id="mode-label">Mode</InputLabel>
        <Select
          labelId="mode-label"
          id="demo-simple-select-outlined"
          value={props.mode}
          label="Mode"
          onChange={props.onModeChange}
        >
          <MenuItem value={projectModes.ORACLE} component="div">
            <ListItem>
              <ListItemText
                primary="Oracle"
                secondary="Start an interactive AI-aided screening with an unlabeled dataset."
              />
            </ListItem>
          </MenuItem>
          <MenuItem value={projectModes.EXPLORATION} component="div">
            <ListItem>
              <ListItemText
                primary="Exploration"
                secondary="Explore an existing, labeled dataset in an interactive way."
              />
            </ListItem>
          </MenuItem>
          {props.showSimulate && (
            <MenuItem value={projectModes.SIMULATION} component="div">
              <ListItem>
                <ListItemText
                  primary="Simulation"
                  secondary="Simulate the performance of ASReview on a labeled dataset."
                />
              </ListItem>
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </Root>
  );
}
