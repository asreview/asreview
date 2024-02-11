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

import { SavingStateBox } from "../SetupComponents";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";

import { AppBarWithinDialog } from "../../Components";
import { SetupStepper } from "../SetupComponents";
import { DataForm } from "../SetupComponents/DataComponents";
import { ModelForm } from "../SetupComponents/ModelComponents";
import { InfoForm } from "../SetupComponents/InfoComponents";
import { ScreenLanding } from "../SetupComponents/ScreenComponents";

import { ProjectAPI } from "../../api/index.js";
import { ProjectContext } from "../../ProjectContext.js";
import { projectModes, projectStatuses } from "../../globals.js";

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

const SetupDialogHeader = ({ mobileScreen, savingState, handleClose }) => {
  if (mobileScreen) return null; // Nothing to display if mobile screen

  return (
    <StyledSetupDialogHeader className="dialog-header" direction="row">
      <DialogTitle className={classesHeader.title}>
        Configure project
      </DialogTitle>
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
    </StyledSetupDialogHeader>
  );
};

const SetupDialog = ({
  project_id,
  open,
  onClose,
  setFeedbackBar,
  mobileScreen,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mode, setMode] = React.useState(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState({
    0: true,
    1: true,
    2: true,
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
    onClose();
  };

  const exitingSetup = () => {
    setFeedbackBar({
      open: true,
      message: `Your project has been saved as draft`,
    });
    queryClient.invalidateQueries("fetchProjects");
    navigate("/projects");
  };

  const exitedSetup = () => {
    setActiveStep(0);
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const [info, setInfo] = React.useState({});

  const { isSuccess: isInfoSuccess } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      onSuccess: (data) => {
        console.log("fetchInfo success");
        setInfo(data);
      },
    },
  );

  const { mutate } = useMutation(ProjectAPI.mutateReviewStatus, {
    mutationKey: ["mutateReviewStatus"],
    onError: () => {
      console.log("error updating status");
    },
    onSuccess: () => {
      onClose();
      if (info["mode"] === projectModes.SIMULATION) {
        navigate(`/projects/${project_id}`);
      } else {
        navigate(`/projects/${project_id}/review`);
      }
    },
  });

  const handleFinish = () => {
    console.log("handleFinish");
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
    <StyledSetupDialog
      aria-label="project setup"
      open={open}
      fullScreen={mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      onClose={handleClose}
      TransitionComponent={Fade}
      TransitionProps={{
        onExiting: () => exitingSetup(),
        onExited: () => exitedSetup(),
      }}
    >
      <ProjectContext.Provider value={project_id}>
        {mobileScreen && <AppBarWithinDialog onClickStartIcon={handleClose} />}
        {!mobileScreen && (
          <SetupDialogHeader
            handleClose={handleClose}
            mobileScreen={mobileScreen}
            savingState={savingState}
          />
        )}
        <DialogContent className={classes.content} dividers>
          <SetupStepper
            activeStep={activeStep}
            handleStep={handleStep}
            completed={completed}
            isStepFailed={isStepFailed}
          />
          <Box
            className={clsx({
              [classes.form]: true,
            })}
          >
            {activeStep === 0 && <InfoForm />}
            {activeStep === 1 && <ModelForm />}
            {activeStep === 2 && <DataForm />}
            {activeStep === 3 && <ScreenLanding />}
          </Box>
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          <Button
            id="next"
            // disabled={disableNext()}
            variant="contained"
            onClick={activeStep === 3 ? handleFinish : handleNext}
          >
            {activeStep === 3 ? "Finish" : "Next"}
          </Button>
        </DialogActions>
      </ProjectContext.Provider>
    </StyledSetupDialog>
  );
};

export default SetupDialog;
