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
  FormLabel,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import { Save } from "@mui/icons-material";
import {
  ModelCard,
  PriorCard,
  TagEditor,
} from "ProjectComponents/SetupComponents";
import {
  DatasetFromEntryPoint,
  DatasetFromFile,
  DatasetFromURI,
  DatasetInfo,
} from "ProjectComponents/SetupComponents/DataUploadComponents";
import { ProjectContext } from "ProjectContext";
import { ProjectAPI } from "api";
import { projectModes, projectStatuses } from "globals.js";
import { useToggle } from "hooks/useToggle";

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

const SetupDialog = ({
  open,
  onClose,
  projectInfo = null,
  mode = null,
  setFeedbackBar,
  mobileScreen,
}) => {
  const navigate = useNavigate();

  const [dataset, setDataset] = React.useState(projectInfo);
  const [showSettings, setShowSettings] = useToggle(false);

  const [editName, toggleEditName] = useToggle(false);
  const [name, setName] = React.useState(dataset?.name || "");

  const [uploadSource, setUploadSource] = React.useState("file");

  const handleUploadSource = (event) => {
    setUploadSource(event.target.value);
  };

  const { isLoading: isMutatingName, mutate: mutateName } = useMutation(
    ProjectAPI.mutateInfo,
    {
      mutationKey: ["mutateInfo"],
      onSuccess: () => {
        toggleEditName();
      },
    },
  );

  const { mutate: setStatus } = useMutation(ProjectAPI.mutateReviewStatus, {
    mutationKey: ["mutateReviewStatus"],
    onSuccess: () => {
      if (mode === projectModes.SIMULATION) {
        navigate(`/projects/${dataset?.id}`);
      } else {
        navigate(`/projects/${dataset?.id}/review`);
      }
    },
  });

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
        sx: { height: !mobileScreen ? "calc(100% - 64px)" : "100%" },
      }}
      onClose={onClose}
      TransitionProps={{
        onExited: () => exitedSetup(),
      }}
    >
      {/* {mobileScreen && (
        <AppBarWithinDialog
          // disableStartIcon={isLoading}
          onClickStartIcon={onClose}
          startIconIsClose
          title="Import dataset"
        />
      )} */}
      {!dataset && (
        <>
          <DialogTitle>Import dataset</DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Add a dataset from</FormLabel>
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
                    onChange={handleUploadSource}
                  />
                  <FormControlLabel
                    value="url"
                    control={<Radio />}
                    label="URL or DOI"
                    onChange={handleUploadSource}
                  />
                  {mode === projectModes.ORACLE && (
                    <FormControlLabel
                      value="extension"
                      control={<Radio />}
                      label="Extension"
                      onChange={handleUploadSource}
                    />
                  )}
                  {(mode === projectModes.EXPLORATION ||
                    mode === projectModes.SIMULATION) && (
                    <FormControlLabel
                      value="benchmark"
                      control={<Radio />}
                      label="Benchmark datasets"
                      onChange={handleUploadSource}
                    />
                  )}
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
                  mobileScreen={mobileScreen}
                />
              )}
              {uploadSource === "benchmark" && (
                <DatasetFromEntryPoint
                  subset="benchmark"
                  mode={mode}
                  setDataset={setDataset}
                  mobileScreen={mobileScreen}
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
          <DialogTitle>
            Start project:{" "}
            {!editName && (
              <>
                {name}
                <Tooltip title={"Edit project name"}>
                  <IconButton
                    onClick={toggleEditName}
                    disabled={isMutatingName}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {editName && (
              <>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isMutatingName}
                  sx={{ width: "50%" }}
                  autoFocus
                />
                <Tooltip title={"Save project name"}>
                  <IconButton
                    onClick={() => {
                      mutateName({ project_id: dataset.id, title: name });
                    }}
                    disabled={isMutatingName}
                  >
                    <Save />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#be7e7b" }}>
            <Collapse in={!showSettings}>
              <Box sx={{ mt: 3 }}>
                <DatasetInfo
                  project_id={dataset?.id}
                  dataset_path={dataset?.dataset_path}
                  setDataset={setDataset}
                />
              </Box>
            </Collapse>

            <Box sx={{ textAlign: "center", my: 2 }}>
              <Button onClick={setShowSettings} sx={{ color: "white" }}>
                {showSettings ? "Show dataset" : "Show options"}
              </Button>
            </Box>
            <Collapse in={showSettings}>
              {mode !== projectModes.SIMULATION && (
                <Box sx={{ mb: 3 }}>
                  <TagEditor
                    project_id={dataset?.id}
                    mobileScreen={mobileScreen}
                  />
                </Box>
              )}
              <Box sx={{ my: 3 }}>
                <ModelCard />
              </Box>
              <Box sx={{ my: 3 }}>
                <PriorCard
                  // setHistoryFilterQuery={setHistoryFilterQuery}
                  editable={true}
                  mobileScreen={mobileScreen}
                />
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
    </StyledSetupDialog>
  );
};

export default SetupDialog;
