import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
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
import { ProjectInfoForm } from "../../ProjectComponents";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";

import { ProjectAPI } from "../../api/index.js";
import {
  mapStateToProps,
  mapDispatchToProps,
  projectModes,
  projectStatuses,
} from "../../globals.js";
import { useToggle } from "../../hooks/useToggle";

const steps = ["Project information", "Data", "Model", "Warm up"];

const PREFIX = "SetupDialog";

const classes = {
  content: `${PREFIX}-content`,
  stepper: `${PREFIX}-stepper`,
  form: `${PREFIX}-form`,
  formWarmup: `${PREFIX}-form-warmup`,
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
  },
}));

const SetupDialog = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const descriptionElementRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);

  // State Step 1: Project information
  const [info, setInfo] = React.useState({
    mode: projectModes.ORACLE,
    title: "",
    authors: "",
    description: "",
    dataset_path: undefined,
  });
  const [disableFetchInfo, setDisableFetchInfo] = React.useState(false); // disable fetch when init a project
  const [exTitle, setExTitle] = React.useState(""); // for comparison to decide on mutate project id
  const [textFiledFocused, setTextFieldFocused] = React.useState(null); // for autosave on blur

  // State Step 2: Data
  const [addDataset, toggleAddDataset] = useToggle();
  const [addPriorKnowledge, toggleAddPriorKnowledge] = useToggle();

  // State Step 3: Model
  const [model, setModel] = React.useState({
    classifier: null,
    query_strategy: null,
    balance_strategy: null,
    feature_extraction: null,
  });

  // State finish setup
  const [trainingStarted, setTrainingStarted] = React.useState(false);
  const [trainingFinished, setTrainingFinished] = React.useState(false);

  /**
   * Step 1: Project information
   */
  const projectHasDataset = () => {
    return info.dataset_path !== undefined && info.dataset_path !== null;
  };

  const handleInfoChange = (event) => {
    if (isMutateInfoError && event.target.name === "title") {
      resetMutateInfo();
    }
    if (isDeleteProjectError) {
      resetDeleteProject();
    }
    if (event.target.name === "mode" && projectHasDataset()) {
      deleteProject({ project_id: props.project_id });
    }
    setInfo({
      ...info,
      [event.target.name]: event.target.value,
    });
  };

  const {
    error: mutateInfoError,
    isError: isMutateInfoError,
    isLoading: isMutatingInfo,
    mutate: mutateInfo,
    reset: resetMutateInfo,
  } = useMutation(ProjectAPI.mutateInfo, {
    onSuccess: (data, variables) => {
      // mutate project id when typed title is different from existing title/empty string
      if (variables.title !== exTitle) {
        props.setProjectId(data["id"]);
      }
      setTextFieldFocused(null);
    },
  });

  const {
    error: fetchInfoError,
    isError: isFetchInfoError,
    isFetching: isFetchingInfo,
  } = useQuery(
    ["fetchInfo", { project_id: props.project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: props.project_id !== null && props.open && !disableFetchInfo,
      onSuccess: (data) => {
        setInfo({
          mode: data["mode"],
          title: data["name"],
          authors: data["authors"] ? data["authors"] : "",
          description: data["description"] ? data["description"] : "",
          dataset_path: data["dataset_path"],
        });
        setExTitle(data["name"]);
        setDisableFetchInfo(true); // avoid getting all the time
      },
      refetchOnWindowFocus: false,
    }
  );

  const {
    error: deleteProjectError,
    isError: isDeleteProjectError,
    mutate: deleteProject,
    reset: resetDeleteProject,
  } = useMutation(ProjectAPI.mutateDeleteProject, {
    onSuccess: () => {
      props.setProjectId(null);
      setTextFieldFocused(null);
      setInfo((s) => {
        return {
          ...s,
          dataset_path: undefined,
        };
      });
      queryClient.resetQueries("fetchLabeledStats");
    },
  });

  const returnInfoError = () => {
    if (isMutateInfoError) {
      return [isMutateInfoError, mutateInfoError];
    } else {
      return [false, null];
    }
  };

  // auto mutate info when text field is not focused
  React.useEffect(() => {
    if (
      props.open &&
      textFiledFocused !== null &&
      !textFiledFocused &&
      !(info.title.length < 3) &&
      !isMutateInfoError
    ) {
      if (props.project_id) {
        mutateInfo({
          project_id: props.project_id,
          mode: info.mode,
          title: info.title,
          authors: info.authors,
          description: info.description,
        });
      }
    }
  }, [
    props.open,
    info,
    isMutateInfoError,
    mutateInfo,
    props.project_id,
    textFiledFocused,
  ]);

  /**
   * Step 2: Data
   */
  const {
    data: labeledStats,
    error: fetchLabeledStatsError,
    isError: isFetchLabeledStatsError,
    isFetching: isFetchingLabeledStats,
  } = useQuery(
    ["fetchLabeledStats", { project_id: props.project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      enabled:
        props.project_id !== null && activeStep === 1 && projectHasDataset(),
      refetchOnWindowFocus: false,
    }
  );

  /**
   * Step3: Model
   */
  const {
    error: mutateModelConfigError,
    isError: isMutateModelConfigError,
    isLoading: isMutatingModelConfig,
    isSuccess: isMutateModelConfigSuccess,
    mutate: mutateModelConfig,
    reset: resetMutateModelConfig,
  } = useMutation(ProjectAPI.mutateModelConfig);

  // auto mutate model selection
  React.useEffect(() => {
    if (
      props.project_id &&
      model.classifier &&
      model.query_strategy &&
      model.balance_strategy &&
      model.feature_extraction
    ) {
      mutateModelConfig({
        project_id: props.project_id,
        classifier: model["classifier"],
        query_strategy: model["query_strategy"],
        balance_strategy: model["balance_strategy"],
        feature_extraction: model["feature_extraction"],
      });
    }
  }, [model, mutateModelConfig, props.project_id]);

  /**
   * Finish setup
   */
  const {
    error: startTrainingError,
    isError: isStartTrainingError,
    mutate: startTraining,
    reset: resetStartTraining,
  } = useMutation(ProjectAPI.mutateStartTraining, {
    onSuccess: () => {
      setTrainingStarted(true);
    },
  });

  const {
    error: projectReadyError,
    isError: isProjectReadyError,
    isFetching: isPreparingProject,
  } = useQuery(
    ["fetchProjectStatus", { project_id: props.project_id }],
    ProjectAPI.fetchProjectStatus,
    {
      enabled: trainingStarted,
      onError: () => {
        setTrainingStarted(false);
      },
      onSuccess: (data) => {
        if (data["status"] !== projectStatuses.SETUP) {
          // model ready
          setTrainingStarted(false);
          setTrainingFinished(true);
        } else {
          // not ready yet
          setTimeout(
            () => queryClient.invalidateQueries("fetchProjectStatus"),
            12000
          );
        }
      },
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const restartTraining = () => {
    resetStartTraining();
    startTraining({ project_id: props.project_id });
  };

  /**
   * Dialog actions
   */
  const handleClose = () => {
    if (activeStep !== 3) {
      setTextFieldFocused(null);
      setExTitle("");
      props.onClose();
      if (props.project_id) {
        props.setFeedbackBar({
          open: true,
          message: `Your project ${info.title} has been saved as draft`,
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
    setInfo({
      mode: projectModes.ORACLE,
      title: "",
      authors: "",
      description: "",
      dataset_path: undefined,
    });
    setModel({
      classifier: null,
      query_strategy: null,
      feature_extraction: null,
    });
    setDisableFetchInfo(false);
    setTrainingStarted(false);
    setTrainingFinished(false);
    if (isMutateInfoError) {
      resetMutateInfo();
    }
    if (isMutateModelConfigError) {
      resetMutateModelConfig();
    }
  };

  const disableNextButton = () => {
    if (activeStep === 0) {
      return isMutateInfoError || info.title.length < 3;
    }
    if (activeStep === 1) {
      return (
        isFetchLabeledStatsError ||
        !labeledStats?.n_prior_inclusions ||
        !labeledStats?.n_prior_exclusions
      );
    }
    if (activeStep === 2) {
      return (
        !isMutateModelConfigSuccess ||
        isMutatingModelConfig ||
        isMutateModelConfigError
      );
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !isMutateInfoError) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    if (activeStep === 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    if (activeStep === 2) {
      startTraining({ project_id: props.project_id });
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // saving state box in step 1 & 3
  const isSaving = () => {
    return isMutatingInfo || isMutatingModelConfig;
  };

  const isStepFailed = (step) => {
    return step === 0 && info?.title.length < 3;
  };

  const isTitleValidated = () => {
    return info.title.length >= 3;
  };

  React.useEffect(() => {
    if (activeStep === 1 && isMutateInfoError) {
      handleBack();
    }
  }, [activeStep, isMutateInfoError]);

  React.useEffect(() => {
    if (props.open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.open]);

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
      TransitionProps={{
        onExited: () => exitedSetup(),
      }}
    >
      {props.mobileScreen && !addDataset && !addPriorKnowledge && (
        <AppBarWithinDialog
          onClickStartIcon={handleClose}
          title={info?.title}
        />
      )}
      {!props.mobileScreen && !addDataset && !addPriorKnowledge && (
        <Fade in={!addDataset}>
          <Stack className="dialog-header" direction="row">
            <DialogTitle>{info?.title}</DialogTitle>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {props.project_id && (activeStep === 0 || activeStep === 2) && (
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
        </Fade>
      )}
      {!addDataset && !addPriorKnowledge && (
        <Fade in={!addDataset}>
          <DialogContent className={classes.content} dividers>
            <Box className={classes.stepper}>
              <Stepper alternativeLabel activeStep={activeStep}>
                {steps.map((label, index) => {
                  const labelProps = {};
                  if (
                    !isFetchingInfo &&
                    !isFetchInfoError &&
                    isStepFailed(index)
                  ) {
                    labelProps.error = true;
                  }
                  return (
                    <Step key={label}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
            <Box
              className={clsx({
                [classes.form]: true,
                [classes.formWarmup]: activeStep === 3,
              })}
            >
              {activeStep === 0 && (
                <ProjectInfoForm
                  info={info}
                  deleteProjectError={deleteProjectError}
                  mutateInfoError={returnInfoError()[1]}
                  isDeleteProjectError={isDeleteProjectError}
                  isMutateInfoError={returnInfoError()[0]}
                  isTitleValidated={isTitleValidated()}
                  handleInfoChange={handleInfoChange}
                  datasetAdded={projectHasDataset()}
                  setTextFieldFocused={setTextFieldFocused}
                />
              )}
              {activeStep === 1 && (
                <DataForm
                  datasetAdded={projectHasDataset()}
                  labeledStats={labeledStats}
                  toggleAddDataset={toggleAddDataset}
                  toggleAddPriorKnowledge={toggleAddPriorKnowledge}
                  fetchInfoError={fetchInfoError}
                  fetchLabeledStatsError={fetchLabeledStatsError}
                  isFetchInfoError={isFetchInfoError}
                  isFetchLabeledStatsError={isFetchLabeledStatsError}
                  isFetchingLabeledStats={isFetchingLabeledStats}
                />
              )}
              {activeStep === 2 && (
                <ModelForm
                  model={model}
                  setModel={setModel}
                  isMutateModelConfigError={isMutateModelConfigError}
                  mutateModelConfigError={mutateModelConfigError}
                  reset={resetMutateModelConfig}
                />
              )}
              {activeStep === 3 && (
                <FinishSetup
                  handleBack={handleBack}
                  isPreparingProject={isPreparingProject}
                  isProjectReadyError={isProjectReadyError}
                  isStartTrainingError={isStartTrainingError}
                  mode={info.mode}
                  projectReadyError={projectReadyError}
                  restartTraining={restartTraining}
                  startTrainingError={startTrainingError}
                  trainingFinished={trainingFinished}
                  toggleProjectSetup={props.onClose}
                />
              )}
            </Box>
          </DialogContent>
        </Fade>
      )}
      {!addDataset && !addPriorKnowledge && activeStep !== 3 && (
        <Fade in={!addDataset}>
          <DialogActions>
            {activeStep !== 0 && (
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              disabled={disableNextButton()}
              variant="contained"
              onClick={handleNext}
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </DialogActions>
        </Fade>
      )}
    </StyledDialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SetupDialog);
