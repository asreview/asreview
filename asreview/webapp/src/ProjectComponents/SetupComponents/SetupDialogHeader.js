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

const SetupDialogHeader = ({ mobileScreen, savingState, handleClose }) => {
  if (mobileScreen) return null; // Nothing to display if mobile screen

  return (
    <Root className="dialog-header" direction="row">
      <DialogTitle className={classes.title}>Configure project</DialogTitle>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <SavingStateBox isSaving={savingState} />
        <Stack
          className="dialog-header-button right"
          direction="row"
          spacing={1}
        >
          <Tooltip title={"Save and close"}>
            <span>
              <StyledIconButton onClick={handleClose}>
                <Close />
              </StyledIconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Root>
  );
};

export default SetupDialogHeader;
