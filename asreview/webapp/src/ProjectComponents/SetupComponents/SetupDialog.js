import * as React from "react";
import { useIsMutating, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Fade,
  Stack,
  Step,
  StepButton,
  StepIcon,
  StepLabel,
  Stepper,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close } from "@mui/icons-material";

import { AppBarWithinDialog } from "../../Components";
import { FinishSetup, SavingStateBox } from "../SetupComponents";
import { DataForm } from "../SetupComponents/DataComponents";
import { ModelForm } from "../SetupComponents/ModelComponents";
import { InfoForm } from "../SetupComponents/InfoComponents";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";
import { StyledStepIcon } from "../../StyledComponents/StyledStepIcon";

import {
  mapStateToProps,
  mapDispatchToProps,
  // projectStatuses,
} from "../../globals.js";

const steps = ["Project information", "Model", "Review criteria"];

const PREFIX = "SetupDialog";

const classes = {
  content: `${PREFIX}-content`,
  stepper: `${PREFIX}-stepper`,
  form: `${PREFIX}-form`,
  formWarmup: `${PREFIX}-form-warmup`,
  title: `${PREFIX}-title`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.content}`]: {
    paddingLeft: 0,
    paddingRight: 0,
    overflowY: "hidden",
  },

  [`& .${classes.stepper}`]: {
    padding: 8,
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
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    height: "100%",
  },

  [`& .${classes.title}`]: {
    height: "64px",
  },
}));

const SetupDialog = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dialog/Project title
  const [title, setTitle] = React.useState("");

  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState({ 0: true });

  const useIsMutatingInfo = useIsMutating(["mutateInfo"]);
  const useIsMutatingModel = useIsMutating(["mutateModelConfig"]);

  const labeled = queryClient.getQueryData([
    "fetchLabeledStats",
    { project_id: props.project_id },
  ]);

  /**
   * Dialog actions
   */
  const handleClose = () => {
    if (activeStep !== 3) {
      props.onClose();
      if (props.project_id) {
        props.setFeedbackBar({
          open: true,
          message: `Your project ${title} has been saved as draft`,
        });
        queryClient.invalidateQueries("fetchProjects");
        navigate("/projects");
      }
    } else {
      console.log("Cannot close when training is in progress");
    }
  };

  const exitedSetup = () => {
    props.setProjectId(null);
    setActiveStep(0);
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

  // saving state box in step 1 & 3
  const isSaving = () => {
    return useIsMutatingInfo === 1 || useIsMutatingModel === 1;
  };

  const isStepCompleted = (step) => {
    if (step === 0) {
      return !isStepFailed(step);
    }
    if (step === 1) {
      return props.project_id !== null;
    }
    if (step === 2) {
      return (
        labeled?.n_prior_inclusions !== 0 && labeled?.n_prior_exclusions !== 0
      );
    }
  };

  const isStepFailed = (step) => {
    return step === 0 && title.length < 1;
  };

  const isTitleValidated = () => {
    return title.length > 0;
  };

  return (
    <StyledDialog
      aria-label="project setup"
      open={props.open}
      fullScreen={props.mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      TransitionComponent={Fade}
      TransitionProps={{
        onExited: () => exitedSetup(),
      }}
    >
      {props.mobileScreen && (
        <AppBarWithinDialog onClickStartIcon={handleClose} title={title} />
      )}
      {!props.mobileScreen && (
        <Stack className="dialog-header" direction="row">
          <DialogTitle className={classes.title}>{title}</DialogTitle>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {props.project_id && (activeStep === 0 || activeStep === 1) && (
              <SavingStateBox isSaving={isSaving()} />
            )}
            <Stack
              className="dialog-header-button right"
              direction="row"
              spacing={1}
            >
              {activeStep !== 3 && (
                <Tooltip
                  title={
                    isTitleValidated()
                      ? "Save and close"
                      : "Disabled as some form fields have errors"
                  }
                >
                  <span>
                    <StyledIconButton
                      disabled={!isTitleValidated()}
                      onClick={handleClose}
                    >
                      <Close />
                    </StyledIconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
      <DialogContent className={classes.content} dividers>
        {activeStep !== 3 && (
          <Box className={classes.stepper}>
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((label, index) => {
                const labelProps = {};
                if (isStepFailed(index)) {
                  labelProps.error = true;
                }
                return (
                  <Step key={label} completed={completed[index]}>
                    <StepButton color="inherit" onClick={handleStep(index)}>
                      <StepLabel
                        StepIconComponent={
                          labelProps.error ||
                          (completed[index] && activeStep !== index)
                            ? StepIcon
                            : StyledStepIcon
                        }
                        StepIconProps={{
                          sx: {
                            width: !labelProps.error ? "19.5px" : "22px",
                            height: !labelProps.error ? "22px" : "22px",
                          },
                        }}
                        {...labelProps}
                      >
                        {label}
                      </StepLabel>
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        )}
        <Box
          className={clsx({
            [classes.form]: true,
            [classes.formWarmup]: activeStep === 3,
          })}
        >
          {activeStep === 0 && (
            <InfoForm
              handleComplete={handleComplete}
              setTitle={setTitle}
              isTitleValidated={isTitleValidated()}
            />
          )}
          {activeStep === 1 && <ModelForm handleComplete={handleComplete} />}
          {activeStep === 2 && (
            <DataForm
              handleComplete={handleComplete}
              toggleAddPrior={props.toggleAddPrior}
            />
          )}
          {activeStep === 3 && (
            <FinishSetup
              handleBack={handleBack}
              toggleProjectSetup={props.onClose}
            />
          )}
        </Box>
      </DialogContent>
      {activeStep !== 3 && (
        <DialogActions>
          {activeStep !== 0 && (
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
          )}
          <Button
            disabled={isStepFailed(activeStep) || !isStepCompleted(activeStep)}
            variant="contained"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SetupDialog);
