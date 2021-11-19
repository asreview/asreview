import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
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
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

import { DetailsForm } from "../SetupComponents/DetailsComponents";
import {
  AddDataset,
  AddPriorKnowledge,
  DataForm,
} from "../SetupComponents/DataComponents";
import { ModelForm } from "../SetupComponents/ModelComponents";

import { ProjectAPI } from "../../api/index.js";
import {
  mapStateToProps,
  mapDispatchToProps,
  projectModes,
} from "../../globals.js";
import { useToggle } from "../../hooks/useToggle";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`:hover`]: {
    backgroundColor: "transparent",
  },
}));

const steps = ["Details", "Data", "Model", "Check"];

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
    padding: "24px 48px 48px 48px",
  },
}));

const SetupDialog = (props) => {
  const queryClient = useQueryClient();
  const descriptionElementRef = React.useRef(null);
  const [showSimulate, setShowSimulate] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);

  const [addDataset, toggleAddDataset] = useToggle();
  const [datasetSource, setDatasetSource] = React.useState("file");
  const [file, setFile] = React.useState(null);
  const [url, setURL] = React.useState("");
  const [extension, setExtension] = React.useState(null);
  const [benchmark, setBenchmark] = React.useState(null);

  const [addPriorKnowledge, toggleAddPriorKnowledge] = useToggle();

  const [model, setModel] = React.useState({
    classifier: null,
    query_strategy: null,
    feature_extraction: null,
  });

  // the state of the form data
  const [details, setDetails] = React.useState({
    mode: projectModes.ORACLE,
    title: "",
    authors: "",
    description: "",
  });

  const handleDetailsChange = (event) => {
    if (isInitError && event.target.name === "title") {
      resetInit();
    }
    if (isMutateDetailsError && event.target.name === "title") {
      resetMutateDetails();
    }
    setDetails({
      ...details,
      [event.target.name]: event.target.value,
    });
  };

  const {
    error: initError,
    isError: isInitError,
    mutate: initProject,
    reset: resetInit,
  } = useMutation(ProjectAPI.mutateInitProject, {
    onSuccess: (data, variables) => {
      props.setProjectId(data["id"]);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    },
  });

  const {
    error: mutateDetailsError,
    isError: isMutateDetailsError,
    mutate: mutateDetails,
    reset: resetMutateDetails,
  } = useMutation(ProjectAPI.mutateInfo, {
    onSuccess: (data, variables) => {
      props.setProjectId(data["id"]);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    },
  });

  const {
    data: fetchedDetails,
    error: fetchDetailsError,
    isError: isFetchDetailsError,
    isFetching: isFetchingDetails,
  } = useQuery(
    ["fetchInfo", { project_id: props.project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: props.project_id !== null,
      onSuccess: (data) => {
        setDetails({
          mode: data["mode"],
          title: data["name"],
          authors: data["authors"],
          description: data["description"],
        });
      },
      refetchOnWindowFocus: false,
    }
  );

  const returnDetailsError = () => {
    if (!props.project_id) {
      return [isInitError, initError];
    }
    if (props.project_id) {
      return [isMutateDetailsError, mutateDetailsError];
    }
  };

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

  const handleClosePriorKnowledge = () => {
    toggleAddPriorKnowledge();
  };

  /**
   * Step3: Model
   */
  const { mutate: mutateModelConfig } = useMutation(
    ProjectAPI.mutateModelConfig,
    {
      onSuccess: () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      },
    }
  );

  /**
   * Dialog actions
   */
  const handleClose = () => {
    props.onClose();
    setDetails({
      mode: projectModes.ORACLE,
      title: "",
      authors: "",
      description: "",
    });
    setActiveStep(0);
    setShowSimulate(false);
    if (isInitError) {
      resetInit();
    }
    if (isMutateDetailsError) {
      resetMutateDetails();
    }
    if (props.project_id) {
      queryClient.invalidateQueries("fetchProjects");
      props.handleAppState("home");
    }
  };

  const disableNextButton = () => {
    if (activeStep === 0) {
      return details.title.length < 3;
    }
    if (activeStep === 1) {
      return !labeledStats?.n_prior;
      // return false; // temporary
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !props.project_id) {
      initProject({
        mode: details.mode,
        title: details.title,
        authors: details.authors,
        description: details.description,
      });
    }
    if (activeStep === 0 && props.project_id) {
      mutateDetails({
        project_id: props.project_id,
        mode: details.mode,
        title: details.title,
        authors: details.authors,
        description: details.description,
      });
    }
    if (activeStep === 1) {
      // temporaray
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
    if (activeStep === 2) {
      mutateModelConfig({
        project_id: props.project_id,
        classifier: model["classifier"],
        query_strategy: model["query_strategy"],
        feature_extraction: model["feature_extraction"],
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  React.useEffect(() => {
    // unlock simulation mode
    if (details.title === "elas" && !showSimulate) {
      setDetails({
        ...details,
        title: "",
        mode: projectModes.SIMULATION,
      });
      setShowSimulate(true);
    }
  }, [details, showSimulate]);

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
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: "calc(100% - 96px)" },
      }}
    >
      {!addDataset && !addPriorKnowledge && (
        <Fade in={!addDataset}>
          <Box className={classes.title}>
            <DialogTitle>Create a new project</DialogTitle>
            <Box className={classes.closeButton}>
              <Tooltip title="Save and close">
                <StyledIconButton onClick={handleClose}>
                  <CloseIcon />
                </StyledIconButton>
              </Tooltip>
            </Box>
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
              <Box sx={{ bgcolor: "rgba(0, 0, 0, 0.06)", pl: 1, pr: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary" }}
                >
                  Saved
                </Typography>
              </Box>
              <Box className={classes.closeButton}>
                <Button onClick={handleClosePriorKnowledge}>Close</Button>
              </Box>
            </Stack>
          </Box>
        </Fade>
      )}
      <Divider />
      {!addDataset && !addPriorKnowledge && (
        <Fade in={!addDataset}>
          <DialogContent className={classes.content}>
            <Box className={classes.stepper}>
              <Stepper alternativeLabel activeStep={activeStep}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
            <Box className={classes.form}>
              {activeStep === 0 && (
                <DetailsForm
                  details={details}
                  error={returnDetailsError()[1]}
                  fetchDetailsError={fetchDetailsError}
                  isError={returnDetailsError()[0]}
                  isFetchDetailsError={isFetchDetailsError}
                  isFetchingDetails={isFetchingDetails}
                  handleChange={handleDetailsChange}
                  showSimulate={showSimulate}
                />
              )}
              {activeStep === 1 && (
                <DataForm
                  details={fetchedDetails}
                  labeledStats={labeledStats}
                  toggleAddDataset={toggleAddDataset}
                  toggleAddPriorKnowledge={toggleAddPriorKnowledge}
                  fetchLabeledStatsError={fetchLabeledStatsError}
                  isFetchLabeledStatsError={isFetchLabeledStatsError}
                  isFetchingLabeledStats={isFetchingLabeledStats}
                />
              )}
              {activeStep === 2 && (
                <ModelForm model={model} setModel={setModel} />
              )}
            </Box>
          </DialogContent>
        </Fade>
      )}

      {addDataset && (
        <AddDataset
          addDatasetError={addDatasetError}
          benchmark={benchmark}
          datasetAdded={fetchedDetails?.projectHasDataset}
          datasetSource={datasetSource}
          extension={extension}
          file={file}
          handleDatasetSource={handleDatasetSource}
          isAddDatasetError={isAddDatasetError}
          isAddingDataset={isAddingDataset}
          mode={details["mode"]}
          reset={resetMutateDataset}
          setFile={setFile}
          setURL={setURL}
          setExtension={setExtension}
          setBenchmark={setBenchmark}
          toggleAddDataset={toggleAddDataset}
          url={url}
        />
      )}

      {addPriorKnowledge && <AddPriorKnowledge />}
      {!addDataset && !addPriorKnowledge && <Divider />}
      {!addDataset && !addPriorKnowledge && (
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
