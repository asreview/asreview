import React from "react";
import { DialogTitle, Stack, Tooltip } from "@mui/material";
import Close from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";

import { SavingStateBox } from "../SetupComponents";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";

const PREFIX = "SetupDialogHeader";

const classes = {
  title: `${PREFIX}-title`,
};

const Root = styled(Stack)(({ theme }) => ({
  [`& .${classes.title}`]: {
    height: "64px",
  },
}));

const SetupDialogHeader = ({
  mobileScreen,
  title,
  activeStep,
  savingState,
  handleClose,
  isTitleValidated,
}) => {
  if (mobileScreen) return null; // Nothing to display if mobile screen

  return (
    <Root className="dialog-header" direction="row">
      <DialogTitle className={classes.title}>{title}</DialogTitle>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {(activeStep === 0 || activeStep === 1) && (
          <SavingStateBox isSaving={savingState} />
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
    </Root>
  );
};

export default SetupDialogHeader;
