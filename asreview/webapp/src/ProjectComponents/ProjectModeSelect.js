import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { styled } from "@mui/material/styles";

import { SelectItem } from "../ProjectComponents";
import { projectModes } from "../globals.js";

const Root = styled("div")(({ theme }) => ({}));

export default function ProjectModeSelect(props) {
  return (
    <Root>
      <FormControl
        disabled={props.disableModeSelect}
        fullWidth
        variant={!props.disableModeSelect ? "outlined" : "filled"}
      >
        <InputLabel id="mode-select-label">Mode</InputLabel>
        <Select
          labelId="mode-select-label"
          id="mode-select"
          inputProps={{
            onFocus: () => props.onFocus(),
            onBlur: () => props.onBlur(),
          }}
          name="mode"
          label="Mode"
          value={props.mode}
          onChange={props.handleMode}
        >
          <MenuItem value={projectModes.ORACLE} divider>
            <SelectItem
              primary="Oracle"
              secondary="Start interactive AI-assisted screening with an unlabeled dataset"
            />
          </MenuItem>
          <MenuItem value={projectModes.EXPLORATION} divider>
            <SelectItem
              primary="Exploration"
              secondary="Explore the power of ASReview LAB with a completely labeled dataset"
            />
          </MenuItem>
          <MenuItem value={projectModes.SIMULATION}>
            <SelectItem
              primary="Simulation"
              secondary="Simulate screening on a completely labeled dataset to understand the performance of an active learning model"
            />
          </MenuItem>
        </Select>
      </FormControl>
    </Root>
  );
}
