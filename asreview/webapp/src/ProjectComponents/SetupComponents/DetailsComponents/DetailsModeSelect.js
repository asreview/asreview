import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { styled } from "@mui/material/styles";

import { SelectItem } from "../../SetupComponents";
import { projectModes } from "../../../globals.js";

const PREFIX = "DetailsModeSelect";

const classes = {
  formControl: `${PREFIX}-formControl`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.formControl}`]: {
    width: "100%",
  },
}));

export default function DetailsModeSelect(props) {
  return (
    <Root>
      <FormControl disabled={props.disableModeSelect} fullWidth>
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
          <MenuItem value={projectModes.EXPLORATION}>
            <SelectItem
              primary="Exploration"
              secondary="Explore the power of ASReview LAB with an existing labeled dataset"
            />
          </MenuItem>
          {props.showSimulate && (
            <MenuItem value={projectModes.SIMULATION}>
              <SelectItem
                primary="Simulation"
                secondary="Simulate screening on a labeled dataset to understand the performance of an active learning model"
              />
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </Root>
  );
}
