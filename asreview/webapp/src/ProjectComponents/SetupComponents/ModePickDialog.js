import * as React from "react";
import PropTypes from "prop-types";
import { useMutation } from "react-query";
import { connect } from "react-redux";
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

import { InlineErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api";
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

const ModePickDialog = ({
  open,
  setProjectId,
  closeModePick,
  closeModePickAndOpenData,
}) => {
  const [mode, setMode] = React.useState(projectModes.ORACLE);

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateInitProject,
    {
      onSuccess: (data) => {
        setProjectId(data["id"]);
        closeModePickAndOpenData();
      },
    },
  );

  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  const handleClickNext = () => {
    mutate({
      mode: mode,
    });
  };

  const handleClickCancel = () => {
    if (!isLoading) {
      closeModePick();
    }
  };

  return (
    <StyledDialog
      maxWidth="sm"
      onClose={handleClickCancel}
      open={open}
      TransitionProps={{
        onExited: () => {
          setMode(projectModes.ORACLE);
          reset();
        },
      }}
    >
      <DialogTitle>Choose type of project</DialogTitle>
      <DialogContent>
        {/* <Box className={classes.box}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Screen an unlabeled or partially labeled dataset with Oracle mode,
            or explore a fully labeled dataset with Validation or Simulation
            mode.{" "}
            <Link
              underline="none"
              href={`https://asreview.readthedocs.io/en/latest/project_create.html#project-modes`}
              target="_blank"
            >
              Learn more
            </Link>
          </Typography>
        </Box> */}
        {isError && <InlineErrorHandler message={error?.message} />}
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
        <Button autoFocus onClick={handleClickCancel}>
          Cancel
        </Button>
        <Button onClick={handleClickNext}>Next</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default connect(null, mapDispatchToProps)(ModePickDialog);

ModePickDialog.propTypes = {
  open: PropTypes.bool.isRequired,
};
