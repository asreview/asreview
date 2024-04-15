import * as React from "react";
import { useQueryClient } from "react-query";
import { Dialog, DialogTitle, Stack, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import Close from "@mui/icons-material/Close";

import { StyledIconButton } from "StyledComponents/StyledButton";

import { SetupDatasetDialogContent } from "./DataComponents";

const PREFIX = "SetupDialog";

const classes = {
  form: `${PREFIX}-form`,
  formWarmup: `${PREFIX}-form-warmup`,
};

const StyledSetupDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.form}`]: {
    height: "calc(100% - 60px)",
    overflowY: "scroll",
    padding: "32px 48px 48px 48px",
    [theme.breakpoints.down("md")]: {
      padding: "32px 24px 48px 24px",
    },
  },
}));

const classesHeader = {
  title: `${PREFIX}-header-title`,
};

const StyledSetupDialogHeader = styled(Stack)(({ theme }) => ({
  [`& .${classesHeader.title}`]: {
    height: "64px",
  },
}));

const simulateSteps = ["Model", "Review criteria"];

const reviewSteps = ["Screen options", "Model", "Pretrain Model"];

const SetupDialogHeader = ({ mobileScreen, onClose }) => {
  if (mobileScreen) return null;

  return (
    <StyledSetupDialogHeader className="dialog-header" direction="row">
      <DialogTitle className={classesHeader.title}>
        Advanced configuration
      </DialogTitle>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Stack
          className="dialog-header-button right"
          direction="row"
          spacing={1}
        >
          <Tooltip title={"Close"}>
            <StyledIconButton onClick={onClose}>
              <Close />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </StyledSetupDialogHeader>
  );
};

const SetupDialog = ({
  open,
  onClose,
  projectInfo = null,
  mode = null,
  setFeedbackBar,
  mobileScreen,
}) => {
  const queryClient = useQueryClient();

  const exitingSetup = () => {
    queryClient.invalidateQueries("fetchProjects");
    // navigate("/projects");
  };

  const exitedSetup = () => {
    setFeedbackBar({
      open: true,
      message: `Your project has been saved as draft`,
    });
  };

  return (
    <StyledSetupDialog
      aria-label="project setup"
      open={open}
      fullScreen={mobileScreen}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { height: !mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      onClose={onClose}
      TransitionProps={{
        onExiting: () => exitingSetup(),
        onExited: () => exitedSetup(),
      }}
    >
      <SetupDatasetDialogContent
        projectInfo={projectInfo}
        mode={mode}
        onClose={onClose}
        mobileScreen={mobileScreen}
      />
    </StyledSetupDialog>
  );
};

export default SetupDialog;
