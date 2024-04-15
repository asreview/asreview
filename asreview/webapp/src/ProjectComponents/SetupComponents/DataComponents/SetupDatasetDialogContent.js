import * as React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from "@mui/material";

import { AppBarWithinDialog } from "Components";
import { InfoForm } from "ProjectComponents/SetupComponents/InfoComponents";
import { DatasetFromFile, DatasetFromEntryPoint, DatasetFromURI } from ".";
import { ProjectAPI } from "api";
import { projectModes, projectStatuses } from "globals.js";
import DatasetInfo from "./DatasetInfo";
import { TagEditor } from "ProjectComponents/SetupComponents/ScreenComponents/TagComponents";
import { PriorSelector } from "ProjectComponents/SetupComponents/PriorComponents";
import { useToggle } from "hooks/useToggle";
import { ModelCard } from "ProjectComponents/SetupComponents/ModelComponents";

const SetupDatasetDialogContent = ({
  mobileScreen,
  onClose,
  mode = null,
  projectInfo = null,
}) => {
  const navigate = useNavigate();

  const [dataset, setDataset] = React.useState(projectInfo);
  const [showSettings, setShowSettings] = useToggle(false);

  const [uploadSource, setUploadSource] = React.useState("file");

  const handleUploadSource = (event) => {
    setUploadSource(event.target.value);
  };

  const { mutate: setStatus } = useMutation(ProjectAPI.mutateReviewStatus, {
    mutationKey: ["mutateReviewStatus"],
    onSuccess: () => {
      if (mode === projectModes.SIMULATION) {
        navigate(`/projects/${dataset.id}`);
      } else {
        navigate(`/projects/${dataset.id}/review`);
      }
    },
  });

  return (
    <>
      {mobileScreen && (
        <AppBarWithinDialog
          // disableStartIcon={isLoading}
          onClickStartIcon={onClose}
          startIconIsClose
          title="Import dataset"
        />
      )}
      {!mobileScreen && <DialogTitle>Import dataset</DialogTitle>}
      <DialogContent>
        <Collapse in={!showSettings}>
          <InfoForm projectInfo={dataset} />

          <DatasetInfo
            project_id={dataset.id}
            dataset_path={dataset.dataset_path}
            setDataset={setDataset}
          />
        </Collapse>

        <Box sx={{ textAlign: "center" }}>
          <Button onClick={setShowSettings}>
            {showSettings ? "Show project" : "Show options"}
          </Button>
        </Box>

        <Collapse in={showSettings}>
          {mode !== projectModes.SIMULATION && (
            <TagEditor project_id={dataset.id} mobileScreen={mobileScreen} />
          )}
          <ModelCard />

          <PriorSelector
            // setHistoryFilterQuery={setHistoryFilterQuery}
            editable={true}
            mobileScreen={mobileScreen}
          />
        </Collapse>

        {!dataset && (
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
        )}
      </DialogContent>

      {dataset && (
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
                project_id: dataset.id,
                status: projectStatuses.REVIEW,
              });
            }}
            // disabled={isLoading}
          >
            {mode === projectModes.SIMULATION ? "Simulate" : "Screen"}
          </Button>
        </DialogActions>
      )}

      {!dataset && (
        <DialogActions>
          <Button
            onClick={onClose}
            // disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogActions>
      )}
    </>
  );
};

export default SetupDatasetDialogContent;
