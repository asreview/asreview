import React from "react";
import { Stepper, Step, StepButton, StepLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

import { StyledStepIcon } from "../../StyledComponents/StyledStepIcon";
import { StepIcon } from "@mui/material";

const steps = [
  "Project information",
  "Model",
  "Review criteria",
  "Screen options",
];

const PREFIX = "SetupStepper";

const classes = {
  step: `${PREFIX}-step`,
};

const Root = styled("div")(({ theme }) => ({
  paddingTop: "16px",
  [`& .${classes.step}`]: {
    padding: "0 80px",
  },
}));

const SetupStepper = ({ activeStep, handleStep, completed, isStepFailed }) => {
  return (
    <Root>
      <Stepper alternativeLabel activeStep={activeStep}>
        {steps.map((label, index) => {
          const isError = isStepFailed(index);
          return (
            <Step
              className={classes.step}
              key={label}
              completed={completed[index]}
            >
              <StepButton
                color="inherit"
                onClick={handleStep(index)}
                disabled={false}
                sx={(theme) => ({
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 205, 0, 0.12)"
                        : "rgba(129, 103, 0, 0.12)",
                  },
                })}
              >
                <StepLabel
                  StepIconComponent={
                    isError || (completed[index] && activeStep !== index)
                      ? StepIcon
                      : StyledStepIcon
                  }
                  StepIconProps={{
                    sx: { width: isError ? "22px" : "19.5px", height: "22px" },
                  }}
                  {...(isError ? { error: true } : {})}
                >
                  {label}
                </StepLabel>
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
    </Root>
  );
};

export default SetupStepper;
