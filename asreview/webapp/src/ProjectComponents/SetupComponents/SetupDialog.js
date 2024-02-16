import * as React from "react";
import {
  useIsMutating,
  useQueryClient,
  useMutation,
  useQuery,
} from "react-query";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Box,
  Button,
  DialogContent,
  DialogActions,
  Dialog,
  Fade,
  DialogTitle,
  Stack,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Close from "@mui/icons-material/Close";

import { StyledIconButton } from "../../StyledComponents/StyledButton";

import { AppBarWithinDialog } from "../../Components";
import { SetupStepper } from "../SetupComponents";
import { PriorForm } from "../SetupComponents/DataComponents";
import { ModelForm } from "../SetupComponents/ModelComponents";
import { InfoForm } from "../SetupComponents/InfoComponents";
import { ScreenLanding } from "../SetupComponents/ScreenComponents";

import { ProjectAPI } from "../../api";
import { ProjectContext } from "../../ProjectContext";
import { projectModes, projectStatuses } from "../../globals";

const PREFIX = "SetupDialog";

const classes = {
  content: `${PREFIX}-content`,
  form: `${PREFIX}-form`,
  formWarmup: `${PREFIX}-form-warmup`,
};

const StyledSetupDialog = styled(Dialog)(({ theme }) => ({
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
}));

const classesHeader = {
  title: `${PREFIX}-header-title`,
};

const StyledSetupDialogHeader = styled(Stack)(({ theme }) => ({
  [`& .${classesHeader.title}`]: {
    height: "64px",
  },
}));

const SetupDialogHeader = ({ mobileScreen, onClose }) => {
  if (mobileScreen) return null; // Nothing to display if mobile screen

  return (
    <StyledSetupDialogHeader className="dialog-header" direction="row">
      <DialogTitle className={classesHeader.title}>
        Configure project
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

const SetupDialogContent = ({ project_id, onClose, mobileScreen }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = React.useState(0);

  /**
   * Dialog actions
   */

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const fetchProjectInfoAndRedirect = React.useCallback(async () => {
    const data = await queryClient.fetchQuery(
      ["fetchInfo", { project_id }],
      ProjectAPI.fetchInfo,
    );
    onClose();
    if (data["mode"] === projectModes.SIMULATION) {
      navigate(`/projects/${project_id}`);
    } else {
      navigate(`/projects/${project_id}/review`);
    }
  }, [project_id, queryClient, navigate, onClose]);

  const { mutate } = useMutation(ProjectAPI.mutateReviewStatus, {
    mutationKey: ["mutateReviewStatus"],
    onError: () => {
      console.log("error updating status");
    },
    onSuccess: () => {
      fetchProjectInfoAndRedirect();
    },
  });

  const handleFinish = () => {
    mutate({
      project_id,
      status: projectStatuses.REVIEW,
      trigger_model: true,
    });
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const isStepFailed = (step) => {
    return false;
  };

  return (
    <ProjectContext.Provider value={project_id}>
      {mobileScreen && <AppBarWithinDialog onClickStartIcon={onClose} />}
      {!mobileScreen && (
        <SetupDialogHeader onClose={onClose} mobileScreen={mobileScreen} />
      )}
      <DialogContent className={classes.content} dividers>
        <SetupStepper
          activeStep={activeStep}
          handleStep={handleStep}
          isStepFailed={isStepFailed}
        />
        <Box
          className={clsx({
            [classes.form]: true,
          })}
        >
          {activeStep === 0 && <InfoForm />}
          {activeStep === 1 && <ModelForm />}
          {activeStep === 2 && <PriorForm />}
          {activeStep === 3 && <ScreenLanding />}
        </Box>
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        <Button
          id="next-setup-button"
          variant="contained"
          onClick={activeStep === 3 ? handleFinish : handleNext}
        >
          {activeStep === 3 ? "Finish" : "Next"}
        </Button>
      </DialogActions>
    </ProjectContext.Provider>
  );
};

const SetupDialog = ({
  project_id,
  open,
  onClose,
  setFeedbackBar,
  mobileScreen,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      maxWidth="md"
      PaperProps={{
        sx: { height: !mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      onClose={onClose}
      TransitionProps={{
        onExiting: () => exitingSetup(),
        onExited: () => exitedSetup(),
      }}
    >
      <SetupDialogContent
        project_id={project_id}
        onClose={onClose}
        mobileScreen={mobileScreen}
      />
    </StyledSetupDialog>
  );
};

export default SetupDialog;
