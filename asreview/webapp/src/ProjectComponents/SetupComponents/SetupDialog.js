import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  Snackbar,
  Tooltip,
} from "@mui/material";
import * as React from "react";

import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import useMediaQuery from "@mui/material/useMediaQuery";

import {
  DatasetCard,
  ModelCard,
  PriorCard,
  TagCard,
} from "ProjectComponents/SetupComponents";
import { ProjectAPI } from "api";
import { ProjectContext } from "context/ProjectContext";
import { projectModes, projectStatuses } from "globals.js";
import { Save, Edit } from "@mui/icons-material";

const DialogProjectName = ({ project_id, dataset_name }) => {
  const [state, setState] = React.useState({
    name: dataset_name,
    edit: false,
  });

  const { isLoading, mutate } = useMutation(ProjectAPI.mutateInfo, {
    mutationKey: ["mutateInfo"],
    onSuccess: (data) => {
      setState({
        name: data?.name,
        edit: false,
      });
    },
  });

  return (
    <DialogTitle>
      Start project:{" "}
      {!state.edit && (
        <>
          {state.name}
          <Tooltip title={"Edit project name"}>
            <IconButton
              onClick={() => {
                setState({
                  ...state,
                  edit: !state.edit,
                });
              }}
            >
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
            disabled={isLoading}
            sx={{ width: "50%" }}
            autoFocus
          />
          <Tooltip title={"Save project name"}>
            <IconButton
              onClick={() => {
                mutate({ project_id: project_id, title: state.name });
              }}
              loading={isLoading}
            >
              <Save />
            </IconButton>
          </Tooltip>
        </>
      )}
    </DialogTitle>
  );
};

const SetupDialog = ({ project_id, mode, open, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  // state management
  const [showSettings, setShowSettings] = React.useState(false);
  const [feedbackBar, setFeedbackBar] = React.useState(null);

  const { data } = useQuery(
    ["fetchProject", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: open,
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: setStatus } = useMutation(ProjectAPI.mutateReviewStatus, {
    mutationKey: ["mutateReviewStatus"],
    onSuccess: () => {
      if (mode === projectModes.SIMULATION) {
        onClose();
      } else {
        navigate(`/reviews/${data?.id}/reviewer`);
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
          sx: {
            height: !fullScreen ? "calc(100% - 64px)" : "100%",
            bgcolor: "background.default",
          },
        }}
        onClose={onClose}
        TransitionProps={{
          onExited: () => {
            queryClient.invalidateQueries("fetchProjects");

            setFeedbackBar(`Your project has been saved as draft`);

            setShowSettings(false);
          },
        }}
        closeAfterTransition={false}
      >
        {data && (
          <ProjectContext.Provider value={data.id}>
            <DialogProjectName project_id={data.id} dataset_name={data.name} />
            <DialogContent>
              <Collapse in={!showSettings}>
                <Box sx={{ mt: 3 }}>
                  <DatasetCard
                    project_id={data?.id}
                    onResetDataset={onClose}
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
                    <TagCard project_id={data?.id} mobileScreen={fullScreen} />
                  </Box>
                )}
                <Box sx={{ my: 3 }}>
                  <ModelCard mode={mode} />
                </Box>
                <Box sx={{ my: 3 }}>
                  <PriorCard editable={true} mode={mode} />
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
                    project_id: data?.id,
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
        open={feedbackBar !== null}
        autoHideDuration={5000}
        onClose={() => setFeedbackBar(null)}
        message={feedbackBar}
      />
    </>
  );
};

export default SetupDialog;
