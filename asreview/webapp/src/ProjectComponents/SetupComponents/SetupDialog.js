import Edit from "@mui/icons-material/Edit";
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
      >
        {data && (
          <ProjectContext.Provider value={data.id}>
            <DialogProjectName project_id={data.id} dataset_name={data.name} />
            <DialogContent>
              <Collapse in={!showSettings}>
                <Box sx={{ mt: 3 }}>
                  <DatasetCard
                    project_id={data?.id}
                    dataset_path={data?.dataset_path}
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
