import Edit from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import * as React from "react";

import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import useMediaQuery from "@mui/material/useMediaQuery";

import {
  DatasetCard,
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";
import {
  DatasetFromEntryPoint,
  DatasetFromFile,
  DatasetFromURI,
} from "ProjectComponents/SetupComponents/DataUploadComponents";
import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { projectModes, projectStatuses } from "globals.js";

const DialogProjectName = ({ project_id, dataset_name }) => {
  const [state, setState] = React.useState({
    name: dataset_name,
    edit: false,
  });

  const { isLoading: isMutatingName, mutate: mutateName } = useMutation(
    ProjectAPI.mutateInfo,
    {
      mutationKey: ["mutateInfo"],
      onSuccess: (data) => {
        setState({
          name: data?.name,
          edit: false,
        });
      },
    },
  );

  const toggleEditName = () => {
    setState({
      ...state,
      edit: !state.edit,
    });
  };

  return (
    <DialogTitle>
      Start project:{" "}
      {!state.edit && (
        <>
          {state.name}
          <Tooltip title={"Edit project name"}>
            <IconButton onClick={toggleEditName}>
              <Edit />
            </IconButton>
          </Tooltip>
        </>
      )}
      {state.edit && (
        <>
          <Input
            value={state.name}
            onChange={(e) => {
              setState({
                ...state,
                name: e.target.value,
              });
            }}
            disabled={isMutatingName}
            sx={{ width: "50%" }}
            autoFocus
          />
          <Button
            onClick={() => {
              mutateName({ project_id: project_id, title: state.name });
            }}
            disabled={isMutatingName}
            variant="contained"
          >
            Save
          </Button>
        </>
      )}
    </DialogTitle>
  );
};

const SetupDialog = ({
  open,
  onClose,
  projectInfo = null,
  mode = null,
  dataSource = "file",
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // state management
  const [dataset, setDataset] = React.useState(projectInfo);
  const [showSettings, setShowSettings] = React.useState(false);
  const [uploadSource, setUploadSource] = React.useState(dataSource);
  const [feedbackBar, setFeedbackBar] = React.useState({
    open: false,
    message: null,
  });

  const { mutate: setStatus } = useMutation(ProjectAPI.mutateReviewStatus, {
    mutationKey: ["mutateReviewStatus"],
    onSuccess: () => {
      if (mode === projectModes.SIMULATION) {
        onClose();
      } else {
        navigate(`/reviews/${dataset?.id}/review`);
      }
    },
  });

  return (
    <>
      <Dialog
        aria-label="project setup"
        open={open}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { height: !fullScreen ? "calc(100% - 64px)" : "100%" },
        }}
        onClose={onClose}
        TransitionProps={{
          onExited: () => {
            queryClient.invalidateQueries("fetchProjects");

            if (dataset) {
              setFeedbackBar({
                open: true,
                message: `Your project has been saved as ${dataset.name}`,
              });
            }

            setDataset(projectInfo);
            setShowSettings(false);
            setUploadSource("file");
          },
        }}
      >
        {!dataset && (
          <>
            <DialogTitle>Start with dataset from</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ height: "100%" }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    aria-label="dataset source"
                    name="row-radio-buttons-group"
                    value={uploadSource}
                  >
                    <FormControlLabel
                      value="file"
                      control={<Radio />}
                      label="File"
                      onChange={(event) => setUploadSource(event.target.value)}
                    />
                    <FormControlLabel
                      value="url"
                      control={<Radio />}
                      label="URL or DOI"
                      onChange={(event) => setUploadSource(event.target.value)}
                    />
                    {mode === projectModes.ORACLE && (
                      <FormControlLabel
                        value="extension"
                        control={<Radio />}
                        label="Extension"
                        onChange={(event) =>
                          setUploadSource(event.target.value)
                        }
                      />
                    )}
                    <FormControlLabel
                      value="benchmark"
                      control={<Radio />}
                      label="Benchmark datasets"
                      onChange={(event) => setUploadSource(event.target.value)}
                    />
                  </RadioGroup>
                </FormControl>
                {uploadSource === "file" && (
                  <DatasetFromFile mode={mode} setDataset={setDataset} />
                )}
                {uploadSource === "url" && (
                  <DatasetFromURI mode={mode} setDataset={setDataset} />
                )}
                {uploadSource === "extension" && (
                  <DatasetFromEntryPoint
                    subset="plugin"
                    mode={mode}
                    setDataset={setDataset}
                    mobileScreen={fullScreen}
                  />
                )}
                {uploadSource === "benchmark" && (
                  <DatasetFromEntryPoint
                    subset="benchmark"
                    mode={mode}
                    setDataset={setDataset}
                    mobileScreen={fullScreen}
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={onClose}
                // disabled={isLoading}
              >
                Cancel
              </Button>
            </DialogActions>{" "}
          </>
        )}
        {dataset && (
          <ProjectContext.Provider value={dataset.id}>
            <DialogProjectName
              project_id={dataset.id}
              dataset_name={dataset.name}
            />
            <DialogContent>
              <Collapse in={!showSettings}>
                <Box sx={{ mt: 3 }}>
                  <DatasetCard
                    project_id={dataset?.id}
                    dataset_path={dataset?.dataset_path}
                    setDataset={setDataset}
                    hideLabeledInfo={mode === projectModes.SIMULATION}
                  />
                </Box>
              </Collapse>

              <Box sx={{ textAlign: "center", my: 2 }}>
                <Button onClick={() => setShowSettings(!showSettings)}>
                  {showSettings ? "Show dataset" : "Show options"}
                </Button>
              </Box>
              <Collapse in={showSettings} mountOnEnter>
                {mode !== projectModes.SIMULATION && (
                  <Box sx={{ mb: 3 }}>
                    <TagCard
                      project_id={dataset?.id}
                      mobileScreen={fullScreen}
                    />
                  </Box>
                )}
                <Box sx={{ my: 3 }}>
                  <ModelCard />
                </Box>
                <Box sx={{ my: 3 }}>
                  <PriorCard editable={true} mobileScreen={fullScreen} />
                </Box>
              </Collapse>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={onClose}
                // disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setStatus({
                    project_id: dataset?.id,
                    status: projectStatuses.REVIEW,
                  });
                }}
                // disabled={isLoading}
              >
                {mode === projectModes.SIMULATION ? "Simulate" : "Screen"}
              </Button>
            </DialogActions>
          </ProjectContext.Provider>
        )}
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={feedbackBar.open}
        autoHideDuration={5000}
        onClose={() => setFeedbackBar({ open: false, message: null })}
        message={feedbackBar.message}
      />
    </>
  );
};

export default SetupDialog;
