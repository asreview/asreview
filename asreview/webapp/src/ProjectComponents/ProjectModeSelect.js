import React from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
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
              secondary="Review your dataset with interactive artificial intelligence (AI)"
            />
          </MenuItem>
          <MenuItem value={projectModes.EXPLORATION} divider>
            <SelectItem
              primary="Validation"
              secondary="Validate labels provided by another screener or derived from an LLM or AI, and explore benchmark datasets"
            />
          </MenuItem>
          <MenuItem value={projectModes.SIMULATION}>
            <SelectItem
              primary="Simulation"
              secondary="Simulate a review on a completely labeled dataset to see the performance of ASReview LAB"
            />
          </MenuItem>
        </Select>
        {props.datasetAdded && (
          <FormHelperText>Editing mode removes the added data</FormHelperText>
        )}
      </FormControl>
    </Root>
  );
}
