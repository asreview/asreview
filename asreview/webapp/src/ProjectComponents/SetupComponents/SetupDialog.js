import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Divider,
  Fade,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close, Feedback } from "@mui/icons-material";

import { FinishSetup, SavingStateBox } from "../SetupComponents";
import {
  AddDataset,
  AddPriorKnowledge,
  DataForm,
} from "../SetupComponents/DataComponents";
import { ModelForm } from "../SetupComponents/ModelComponents";
import { ProjectInfoForm } from "../../ProjectComponents";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";

import { ProjectAPI } from "../../api/index.js";
import {
  mapStateToProps,
  mapDispatchToProps,
  projectModes,
} from "../../globals.js";
import { useToggle } from "../../hooks/useToggle";

const steps = ["Basic information", "Data", "Model"];

const PREFIX = "SetupDialog";

const classes = {
  title: `${PREFIX}-title`,
  closeButton: `${PREFIX}-close-button`,
  content: `${PREFIX}-content`,
  stepper: `${PREFIX}-stepper`,
  form: `${PREFIX}-form`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.title}`]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  [`& .${classes.closeButton}`]: {
    paddingRight: 24,
  },

  [`& .${classes.content}`]: {
    overflowY: "hidden",
    paddingLeft: 0,
    paddingRight: 0,
  },

  [`& .${classes.stepper}`]: {
    padding: 8,
  },

  [`& .${classes.form}`]: {
    height: "calc(100% - 60px)",
    overflowY: "scroll",
    padding: "32px 48px 48px 48px",
  },
}));

const SetupDialog = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const descriptionElementRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);

  // State Step 1: Basic information
  const [info, setInfo] = React.useState({
    mode: projectModes.ORACLE,
    title: "",
    authors: "",
    description: "",
  });
  const [disableFetchInfo, setDisableFetchInfo] = React.useState(false); // disable fetch when init a project
  const [disableModeSelect, setDisableModeSelect] = React.useState(false);
  const [exTitle, setExTitle] = React.useState(""); // for comparison to decide on mutate project id
  const [showSimulate, setShowSimulate] = React.useState(false);
  const [textFiledFocused, setTextFieldFocused] = React.useState(null); // for autosave on blur

  // State Step 2: Data
  const [addDataset, toggleAddDataset] = useToggle();
  const [datasetSource, setDatasetSource] = React.useState("file");
  const [file, setFile] = React.useState(null);
  const [url, setURL] = React.useState("");
  const [extension, setExtension] = React.useState(null);
  const [benchmark, setBenchmark] = React.useState(null);
  const [addPriorKnowledge, toggleAddPriorKnowledge] = useToggle();

  // State Step 3: Model
  const [model, setModel] = React.useState({
    classifier: null,
    query_strategy: null,
    feature_extraction: null,
  });

  // State finish setup
  const [trainingStarted, setTrainingStarted] = React.useState(false);
  const [trainingFinished, setTrainingFinished] = React.useState(false);

  /**
   * Step 1: Basic information
   */
  const handleInfoChange = (event) => {
    if (isInitError && event.target.name === "title") {
      resetInit();
    }
    if (isMutateInfoError && event.target.name === "title") {
      resetMutateInfo();
    }
    setInfo({
      ...info,
      [event.target.name]: event.target.value,
    });
  };

  const {
    error: initError,
    isError: isInitError,
    isLoading: isMutatingInitProject,
    mutate: initProject,
    reset: resetInit,
  } = useMutation(ProjectAPI.mutateInitProject, {
    onSuccess: (data, variables) => {
      props.setProjectId(data["id"]);
      setTextFieldFocused(null);
    },
  });

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
    data: fetchedInfo,
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
          authors: data["authors"],
          description: data["description"],
        });
        setExTitle(data["name"]);
        setDisableFetchInfo(true); // avoid getting all the time
        setDisableModeSelect(true);
      },
      refetchOnWindowFocus: false,
    }
  );

  const returnInfoError = () => {
    if (!props.project_id) {
      return [isInitError, initError];
    }
    if (props.project_id) {
      return [isMutateInfoError, mutateInfoError];
    }
  };

  React.useEffect(() => {
    if (props.open && !props.project_id && !disableFetchInfo) {
      // disable fetch info query when initiate a new project
      setDisableFetchInfo(true);
    }
  }, [props.open, props.project_id, disableFetchInfo]);

  // auto mutate info when text field is not focused
  React.useEffect(() => {
    if (
      props.open &&
      textFiledFocused !== null &&
      !textFiledFocused &&
      !(info.title.length < 3) &&
      !isInitError &&
      !isMutateInfoError
    ) {
      if (!props.project_id) {
        initProject({
          mode: info.mode,
          title: info.title,
          authors: info.authors,
          description: info.description,
        });
      }
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
    initProject,
    isInitError,
    isMutateInfoError,
    mutateInfo,
    props.project_id,
    textFiledFocused,
  ]);

  /**
   * Step 2: Data
   */
  const {
    error: addDatasetError,
    isError: isAddDatasetError,
    isLoading: isAddingDataset,
    mutate: mutateDataset,
    reset: resetMutateDataset,
  } = useMutation(ProjectAPI.mutateData, {
    onSuccess: () => {
      setDisableFetchInfo(false); // refetch after adding a dataset
      queryClient.invalidateQueries("fetchInfo");
      queryClient.invalidateQueries("fetchLabeledStats");
      toggleAddDataset();
      setDatasetSource("file");
    },
    onSettled: () => {
      setFile(null);
      setURL("");
      setExtension(null);
      setBenchmark(null);
    },
  });

  const {
    data: labeledStats,
    error: fetchLabeledStatsError,
    isError: isFetchLabeledStatsError,
    isFetching: isFetchingLabeledStats,
  } = useQuery(
    ["fetchLabeledStats", { project_id: props.project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      enabled: props.project_id !== null && activeStep === 1,
      refetchOnWindowFocus: false,
    }
  );

  const handleDatasetSource = (event) => {
    setDatasetSource(event.target.value);
    resetMutateDataset();
  };

  const handleDiscardDataset = () => {
    toggleAddDataset();
    setDatasetSource("file");
    setFile(null);
    setURL("");
    setExtension(null);
    setBenchmark(null);
    resetMutateDataset();
  };

  const handleSaveDataset = () => {
    mutateDataset({
      project_id: props.project_id,
      file: file,
      url: url,
      extension: extension,
      benchmark: benchmark,
    });
  };

  const disableSaveDataset = () => {
    if (datasetSource === "file") {
      return !file;
    }
    if (datasetSource === "url") {
      return !url;
    }
    if (datasetSource === "extension") {
      return !extension;
    }
    if (datasetSource === "benchmark") {
      return !benchmark;
    }
  };

  const isEnoughPriorKnowledge = () => {
    return (
      labeledStats?.n_prior_exclusions > 4 &&
      labeledStats?.n_prior_inclusions > 4
    );
  };

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
      model.feature_extraction
    ) {
      mutateModelConfig({
        project_id: props.project_id,
        classifier: model["classifier"],
        query_strategy: model["query_strategy"],
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
    ["fetchProjectReady", { project_id: props.project_id }],
    ProjectAPI.fetchProjectReady,
    {
      enabled: trainingStarted,
      onSuccess: (data) => {
        if (data["status"] === 1) {
          // model ready
          setTrainingStarted(false);
          setTrainingFinished(true);
        } else {
          // not ready yet
          setTimeout(
            () => queryClient.invalidateQueries("fetchProjectReady"),
            24000
          );
        }
      },
      refetchOnWindowFocus: false,
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
  };

  const exitedSetup = () => {
    props.setProjectId(null);
    setActiveStep(0);
    setInfo({
      mode: projectModes.ORACLE,
      title: "",
      authors: "",
      description: "",
    });
    setModel({
      classifier: null,
      query_strategy: null,
      feature_extraction: null,
    });
    setDisableFetchInfo(false);
    setDisableModeSelect(false);
    setShowSimulate(false);
    setTrainingStarted(false);
    setTrainingFinished(false);
    if (isInitError) {
      resetInit();
    }
    if (isMutateInfoError) {
      resetMutateInfo();
    }
    if (isAddDatasetError) {
      resetMutateDataset();
    }
    if (isMutateModelConfigError) {
      resetMutateModelConfig();
    }
  };

  const disableNextButton = () => {
    if (activeStep === 0) {
      return isInitError || isMutateInfoError || info.title.length < 3;
    }
    if (activeStep === 1) {
      return (
        isAddDatasetError ||
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
    if (activeStep === 0 && !isInitError && !isMutateInfoError) {
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
    return isMutatingInitProject || isMutatingInfo || isMutatingModelConfig;
  };

  const isSavingPriorKnowledge = () => {
    return (
      queryClient.isMutating({ mutationKey: "mutatePriorKnowledge" }) ||
      queryClient.isMutating({ mutationKey: "mutateLabeledPriorKnowledge" })
    );
  };

  React.useEffect(() => {
    if (activeStep === 1 && (isInitError || isMutateInfoError)) {
      handleBack();
    }
  }, [activeStep, isInitError, isMutateInfoError]);

  React.useEffect(() => {
    // unlock simulation mode
    if (info.title === "elas" && !showSimulate) {
      setInfo({
        ...info,
        title: "",
        mode: projectModes.SIMULATION,
      });
      setShowSimulate(true);
    }
  }, [info, showSimulate]);

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
      {!addDataset && !addPriorKnowledge && (
        <Fade in={!addDataset}>
          <Box className={classes.title}>
            <DialogTitle>Create a new project</DialogTitle>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {props.project_id && (activeStep === 0 || activeStep === 2) && (
                <SavingStateBox isSaving={isSaving()} />
              )}
              <Box className={classes.closeButton}>
                <Tooltip title="Send feedback">
                  <StyledIconButton
                    component={"a"}
                    href={`https://github.com/asreview/asreview/discussions`}
                    target="_blank"
                  >
                    <Feedback />
                  </StyledIconButton>
                </Tooltip>
                {activeStep !== 3 && (
                  <Tooltip title="Save and close">
                    <StyledIconButton onClick={handleClose}>
                      <Close />
                    </StyledIconButton>
                  </Tooltip>
                )}
              </Box>
            </Stack>
          </Box>
        </Fade>
      )}
      {addDataset && (
        <Fade in={addDataset}>
          <Box className={classes.title}>
            <DialogTitle>Dataset</DialogTitle>
            <Stack direction="row" spacing={2} className={classes.closeButton}>
              <Button disabled={isAddingDataset} onClick={handleDiscardDataset}>
                Discard Changes
              </Button>
              <LoadingButton
                disabled={disableSaveDataset()}
                loading={isAddingDataset}
                variant="contained"
                onClick={handleSaveDataset}
              >
                Save
              </LoadingButton>
            </Stack>
          </Box>
        </Fade>
      )}
      {addPriorKnowledge && (
        <Fade in={addPriorKnowledge}>
          <Box className={classes.title}>
            <DialogTitle>Prior knowledge</DialogTitle>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {isEnoughPriorKnowledge() && (
                <Typography variant="body2" sx={{ color: "secondary.main" }}>
                  Enough prior knowledge. Click CLOSE to move on to the next
                  step.
                </Typography>
              )}
              {labeledStats?.n_prior !== 0 && (
                <SavingStateBox isSaving={isSavingPriorKnowledge()} />
              )}
              <Box className={classes.closeButton}>
                <Button
                  variant={!isEnoughPriorKnowledge() ? "text" : "contained"}
                  onClick={toggleAddPriorKnowledge}
                >
                  Close
                </Button>
              </Box>
            </Stack>
          </Box>
        </Fade>
      )}
      <Divider />
      {!addDataset && !addPriorKnowledge && (
        <Fade in={!addDataset}>
          <DialogContent className={classes.content}>
            {(activeStep === 0 || activeStep === 1 || activeStep === 2) && (
              <Box className={classes.stepper}>
                <Stepper alternativeLabel activeStep={activeStep}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}
            <Box className={classes.form}>
              {activeStep === 0 && (
                <ProjectInfoForm
                  info={info}
                  disableModeSelect={disableModeSelect}
                  mutateInfoError={returnInfoError()[1]}
                  fetchInfoError={fetchInfoError}
                  isMutateInfoError={returnInfoError()[0]}
                  isFetchInfoError={isFetchInfoError}
                  isFetchingInfo={isFetchingInfo}
                  handleInfoChange={handleInfoChange}
                  showSimulate={showSimulate}
                  setTextFieldFocused={setTextFieldFocused}
                />
              )}
              {activeStep === 1 && (
                <DataForm
                  info={fetchedInfo}
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
                  isPreparingProject={isPreparingProject}
                  isProjectReadyError={isProjectReadyError}
                  isStartTrainingError={isStartTrainingError}
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

      {addDataset && (
        <AddDataset
          addDatasetError={addDatasetError}
          benchmark={benchmark}
          datasetAdded={fetchedInfo?.projectHasDataset}
          datasetSource={datasetSource}
          extension={extension}
          file={file}
          handleDatasetSource={handleDatasetSource}
          isAddDatasetError={isAddDatasetError}
          isAddingDataset={isAddingDataset}
          mode={info["mode"]}
          reset={resetMutateDataset}
          setFile={setFile}
          setURL={setURL}
          setExtension={setExtension}
          setBenchmark={setBenchmark}
          toggleAddDataset={toggleAddDataset}
          url={url}
        />
      )}

      {addPriorKnowledge && (
        <AddPriorKnowledge
          n_prior={labeledStats?.n_prior}
          n_prior_exclusions={labeledStats?.n_prior_exclusions}
          n_prior_inclusions={labeledStats?.n_prior_inclusions}
        />
      )}
      {!addDataset && !addPriorKnowledge && <Divider />}
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
