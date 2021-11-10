import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { projectModes } from "../../globals.js";

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
      <FormControl variant="outlined" disabled={props.edit} fullWidth required>
        <InputLabel id="mode-select-label">Mode</InputLabel>
        <Select
          labelId="mode-select-label"
          id="mode-select"
          name="mode"
          label="Mode *"
          value={props.mode}
          onChange={props.handleMode}
        >
          <MenuItem value={projectModes.ORACLE} divider>
            <Box>
              <Typography variant="subtitle1">Oracle</Typography>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ color: "text.secondary" }}
              >
                Start an interactive AI-aided screening with an unlabeled
                dataset.
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem value={projectModes.EXPLORATION}>
            <Box>
              <Typography variant="subtitle1">Exploration</Typography>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ color: "text.secondary" }}
              >
                Explore an existing, labeled dataset in an interactive way.
              </Typography>
            </Box>
          </MenuItem>
          {props.showSimulate && (
            <MenuItem value={projectModes.SIMULATION}>
              <Box>
                <Typography variant="subtitle1">Simulation</Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{ color: "text.secondary" }}
                >
                  Simulate the performance of ASReview on a labeled dataset.
                </Typography>
              </Box>
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </Root>
  );
}
