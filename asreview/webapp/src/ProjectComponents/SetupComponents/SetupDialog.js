import * as React from "react";
import { useIsMutating, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Box,
  Button,
  DialogContent,
  DialogActions,
  Dialog,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { AppBarWithinDialog } from "../../Components";
import {
  FinishSetup,
  SetupDialogHeader,
  SetupStepper,
} from "../SetupComponents";
import { DataForm } from "../SetupComponents/DataComponents";
import { ModelForm } from "../SetupComponents/ModelComponents";
import { InfoForm } from "../SetupComponents/InfoComponents";
import { ScreenLanding } from "../SetupComponents/ScreenComponents";

import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps, mapDispatchToProps } from "../../globals.js";
import { useContext } from "react";
import { ProjectContext } from "../../ProjectContext.js";

const PREFIX = "SetupDialog";

const classes = {
  content: `${PREFIX}-content`,
  form: `${PREFIX}-form`,
  formWarmup: `${PREFIX}-form-warmup`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.content}`]: {
    paddingLeft: 0,
    paddingRight: 0,
    overflowY: "hidden",
  },

  [`& .${classes.form}`]: {
    height: "calc(100% - 60px)",
    overflowY: "scroll",
    padding: "32px 48px 48px 48px",
    [theme.breakpoints.down("md")]: {
      padding: "32px 24px 48px 24px",
    },
  },

  [`& .${classes.formWarmup}`]: {
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "center",
    height: "100%",
  },
}));

const SetupDialog = ({
  project_id,
  onClose,
  setFeedbackBar,
  open,
  mobileScreen,
  onAddPrior,
  setProjectId,
  toggleImportDataset,
  toggleAddPrior,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dialog/Project title
  const [title, setTitle] = React.useState("");

  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState({
    0: true,
    1: false,
    2: false,
    3: true,
  });

  const [savingState, setSavingState] = React.useState(false);
  const timerRef = React.useRef(null);

  const isMutatingInfo = useIsMutating(["mutateInfo"]);
  const isMutatingModel = useIsMutating(["mutateModelConfig"]);

  /**
   * Dialog actions
   */
  const handleClose = () => {
    if (activeStep !== 4) {
      onClose();
    } else {
      console.log("Cannot close when training is in progress");
    }
  };

  const exitingSetup = () => {
    setFeedbackBar({
      open: true,
      message: `Your project ${title} has been saved as draft`,
    });
    queryClient.invalidateQueries("fetchProjects");
    navigate("/projects");
  };

  const exitedSetup = () => {
    setProjectId(null);
    setActiveStep(0);
    setCompleted({ 0: true, 1: false, 2: false, 3: true });
  };

  const handleNext = () => {
    const newActiveStep = activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleComplete = (value) => {
    const newCompleted = completed;
    newCompleted[activeStep] = value;
    setCompleted(newCompleted);
  };

  const isStepFailed = (step) => {
    return step === 0 && title.length < 1;
  };

  const isAllStepsCompleted = () => {
    return Object.values(completed).every((v) => v === true);
  };

  const disableNext = () => {
    return (
      isStepFailed(activeStep) ||
      !completed[activeStep] ||
      (activeStep === 3 && !isAllStepsCompleted())
    );
  };

  const isTitleValidated = () => {
    return title.length > 0;
  };

  // check if model is configured
  React.useEffect(() => {
    if (open && project_id !== null) {
      queryClient
        .fetchQuery(
          ["fetchModelConfig", { project_id: project_id }],
          ProjectAPI.fetchModelConfig,
        )
        .then((data) => {
          if (data !== null) {
            setCompleted((c) => ({ ...c, 1: true }));
          }
        });
    }
  }, [open, project_id, queryClient]);

  // check if prior data is added
  React.useEffect(() => {
    if (open && project_id !== null && !onAddPrior) {
      queryClient
        .fetchQuery(
          ["fetchLabeledStats", { project_id: project_id }],
          ProjectAPI.fetchLabeledStats,
        )
        .then((data) => {
          if (data.n_prior_inclusions !== 0 && data.n_prior_exclusions !== 0) {
            setCompleted((c) => ({ ...c, 2: true }));
          }
        });
    }
  }, [open, project_id, onAddPrior, queryClient]);

  React.useEffect(() => {
    const currentSavingStatus = isMutatingInfo === 1 || isMutatingModel === 1;

    // If the status changes to 'saving', immediately update the state
    if (currentSavingStatus) {
      setSavingState(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      // If the status changes to 'not saving', delay the update by 1000ms
      timerRef.current = setTimeout(() => setSavingState(false), 1000);
    }

    // Cleanup on unmount or if dependencies change
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMutatingInfo, isMutatingModel]);

  return (
    <StyledDialog
      aria-label="project setup"
      open={open}
      fullScreen={mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      TransitionComponent={Fade}
      TransitionProps={{
        onExiting: () => exitingSetup(),
        onExited: () => exitedSetup(),
      }}
    >
      <ProjectContext.Provider value={project_id}>
        {mobileScreen && (
          <AppBarWithinDialog onClickStartIcon={handleClose} title={title} />
        )}
        {!mobileScreen && (
          <SetupDialogHeader
            activeStep={activeStep}
            handleClose={handleClose}
            isTitleValidated={isTitleValidated}
            mobileScreen={mobileScreen}
            savingState={savingState}
          />
        )}
        <DialogContent className={classes.content} dividers>
          {activeStep !== 4 && (
            <SetupStepper
              activeStep={activeStep}
              handleStep={handleStep}
              completed={completed}
              isStepFailed={isStepFailed}
            />
          )}
          <Box
            className={clsx({
              [classes.form]: true,
              [classes.formWarmup]: activeStep === 4,
            })}
          >
            {activeStep === 0 && (
              <InfoForm
                handleComplete={handleComplete}
                setTitle={setTitle}
                isTitleValidated={isTitleValidated()}
                toggleImportDataset={toggleImportDataset}
              />
            )}
            {activeStep === 1 && <ModelForm handleComplete={handleComplete} />}
            {activeStep === 2 && (
              <DataForm
                handleComplete={handleComplete}
                toggleAddPrior={toggleAddPrior}
              />
            )}
            {activeStep === 3 && (
              <ScreenLanding handleComplete={handleComplete} />
            )}
            {activeStep === 4 && (
              <FinishSetup
                handleBack={handleBack}
                toggleProjectSetup={onClose}
              />
            )}
          </Box>
        </DialogContent>
        {activeStep !== 4 && (
          <DialogActions>
            {activeStep !== 0 && (
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              id="next"
              disabled={disableNext()}
              variant="contained"
              onClick={handleNext}
            >
              {activeStep === 3 ? "Finish" : "Next"}
            </Button>
          </DialogActions>
        )}
      </ProjectContext.Provider>
    </StyledDialog>
  );
};

export default SetupDialog;
