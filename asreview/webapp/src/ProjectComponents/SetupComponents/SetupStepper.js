import React from "react";
import { Stepper, Step, StepButton, StepLabel } from "@mui/material";

const steps = [
  "Project information",
  "Screen options",
  "Model",
  "Review criteria",
];

const SetupStepper = ({ activeStep, handleStep }) => {
  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      sx={{ padding: "12px 6px 24px 6px" }}
    >
      {steps.map((label, index) => {
        return (
          <Step key={label} completed={index < activeStep}>
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
                StepIconProps={{
                  sx: { width: "19.5px", height: "22px" },
                }}
              >
                {label}
              </StepLabel>
            </StepButton>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default SetupStepper;
