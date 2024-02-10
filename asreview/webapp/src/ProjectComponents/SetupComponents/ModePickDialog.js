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
  Link,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { InlineErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api";
import { mapDispatchToProps, projectModes } from "../../globals";

const PREFIX = "ModePickDialog";

const classes = {
  avatar: `${PREFIX}-avatar`,
  box: `${PREFIX}-box`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.avatar}`]: {
    backgroundColor: [
      theme.palette.mode === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[100],
    ],
  },
  [`& .${classes.box}`]: {
    paddingBottom: 24,
  },
}));

const modes = [
  {
    value: projectModes.ORACLE,
    primary: "Oracle",
  },
  {
    value: projectModes.EXPLORATION,
    primary: "Validation",
  },
  {
    value: projectModes.SIMULATION,
    primary: "Simulation",
  },
];

const ModePickDialog = ({
  open,
  setProjectId,
  closeModePick,
  closeModePickAndOpenData,
}) => {
  const [mode, setMode] = React.useState(projectModes.ORACLE);

  /**
   * Initiate a new project.
   */
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

  const handleClickContinue = () => {
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
      maxWidth="xs"
      onClose={handleClickCancel}
      open={open}
      TransitionProps={{
        onExited: () => {
          setMode(projectModes.ORACLE);
          reset(); // reset the error of init project
        },
      }}
    >
      <DialogTitle>Choose a project mode</DialogTitle>
      <DialogContent>
        <Box className={classes.box}>
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
        </Box>
        {isError && <InlineErrorHandler message={error?.message} />}
        <RadioGroup
          aria-label="project-mode"
          name="mode"
          value={mode}
          onChange={handleModeChange}
        >
          {modes.map((mode) => (
            <FormControlLabel
              key={mode.value}
              value={mode.value}
              control={<Radio />}
              label={mode.primary}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClickCancel}>
          Cancel
        </Button>
        <Button onClick={handleClickContinue}>Continue</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default connect(null, mapDispatchToProps)(ModePickDialog);

ModePickDialog.propTypes = {
  open: PropTypes.bool.isRequired,
};
