import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { mapDispatchToProps, projectModes } from "../../globals";

const PREFIX = "ModePickDialog";

const classes = {
  box: `${PREFIX}-box`,
  radioGroup: `${PREFIX}-radio-group`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.box}`]: {},
  [`& .${classes.radioGroup}`]: {
    padding: "20px 6px 20px 6px",
    margin: "6px 0px 6px 0px",
    border: "2px solid #e0e0e0",
    borderRadius: "4px",
  },
}));

const SelectItem = ({
  primary,
  secondary,
  unlabeled,
  partiallyLabeled,
  fullyLabeled,
}) => (
  <Box>
    <Typography sx={{ fontWeight: "bold" }}>{primary}</Typography>
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {secondary}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: "text.secondary", paddingTop: "8px" }}
    >
      {"Type(s) of datasets:"}
    </Typography>
    <Stack direction="row" alignItems="center" gap={1}>
      {unlabeled ? <CheckIcon /> : <CloseIcon />}
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {"Unlabeled"}
      </Typography>
    </Stack>
    <Stack direction="row" alignItems="center" gap={1}>
      {partiallyLabeled ? <CheckIcon /> : <CloseIcon />}
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {"Partially labeled"}
      </Typography>
    </Stack>
    <Stack direction="row" alignItems="center" gap={1}>
      {fullyLabeled ? <CheckIcon /> : <CloseIcon />}
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {"Fully labeled or built-in SYNERGY dataset"}
      </Typography>
    </Stack>
  </Box>
);

const ModePickDialog = ({ open, closeModePick, closeModePickAndOpenData }) => {
  const [mode, setMode] = React.useState(projectModes.ORACLE);

  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  const handleClickNext = () => {
    closeModePickAndOpenData(mode);
  };

  return (
    <StyledDialog
      maxWidth="sm"
      onClose={closeModePick}
      open={open}
      TransitionProps={{
        onExited: () => {
          setMode(projectModes.ORACLE);
        },
      }}
    >
      <DialogTitle>Choose type of project</DialogTitle>
      <DialogContent>
        <RadioGroup
          aria-label="project-mode"
          name="mode"
          value={mode}
          onChange={handleModeChange}
        >
          <FormControlLabel
            key={projectModes.ORACLE}
            value={projectModes.ORACLE}
            control={<Radio />}
            label={
              <SelectItem
                primary={"Oracle"}
                secondary={
                  "Review with the help of time-saving Artificial Intelligence"
                }
                unlabeled={true}
                partiallyLabeled={true}
              />
            }
            className={classes.radioGroup}
          />
          <FormControlLabel
            key={projectModes.EXPLORATION}
            value={projectModes.EXPLORATION}
            control={<Radio />}
            label={
              <SelectItem
                primary={"Validation"}
                secondary={
                  "Validate labels provided by another screener or derived from an LLM or AI"
                }
                fullyLabeled={true}
                partiallyLabeled={true}
              />
            }
            className={classes.radioGroup}
          />
          <FormControlLabel
            key={projectModes.SIMULATION}
            value={projectModes.SIMULATION}
            control={<Radio />}
            label={
              <SelectItem
                primary={"Simulation"}
                secondary={
                  "Simulate a review to evaluate the performance of ASReview LAB"
                }
                fullyLabeled={true}
              />
            }
            className={classes.radioGroup}
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={closeModePick}>
          Cancel
        </Button>
        <Button onClick={handleClickNext}>Next</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ModePickDialog;
