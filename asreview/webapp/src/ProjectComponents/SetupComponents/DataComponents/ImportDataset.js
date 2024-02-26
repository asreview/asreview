import * as React from "react";
import {
  useIsMutating,
  useMutation,
  useQueryClient,
  useQuery,
} from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close } from "@mui/icons-material";

import { AppBarWithinDialog } from "../../../Components";
import { StyledIconButton } from "../../../StyledComponents/StyledButton";
import { DatasetFromFile, DatasetFromEntryPoint, DatasetFromURI } from ".";
import { InfoCard } from "..";
import { ProjectAPI } from "../../../api";
import {
  mapDispatchToProps,
  mapStateToProps,
  projectModes,
  projectStatuses,
} from "../../../globals";
import DatasetInfo from "./DatasetInfo";

const PREFIX = "ImportDataset";

const classes = {
  root: `${PREFIX}-root`,
  form: `${PREFIX}-form`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  // overflowY: "hidden",
  [`& .${classes.form}`]: {
    // height: "calc(100% - 64px)",
    // overflowY: "scroll",
    // padding: "24px 48px 48px 48px",
    // [theme.breakpoints.down("md")]: {
    //   height: "calc(100% - 56px)",
    //   padding: "32px 24px 48px 24px",
    // },
  },
}));

const ImportDataset = ({
  open,
  mode,
  closeDataPickAndOpenSetup,
  mobileScreen,
  closeDataPick,
}) => {
  const navigate = useNavigate();

  const [dataset, setDataset] = React.useState(null);
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
    <StyledDialog
      open={open}
      fullScreen={mobileScreen}
      fullWidth
      onClose={closeDataPick}
      maxWidth="md"
      PaperProps={{
        sx: { height: !mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      TransitionProps={{
        onEnter: () => {
          if (mode === projectModes.SIMULATION) {
            setUploadSource("benchmark");
          }
        },
        onExit: () => {
          setUploadSource("file");
          setDataset(null);
        },
      }}
    >
      {mobileScreen && (
        <AppBarWithinDialog
          // disableStartIcon={isLoading}
          onClickStartIcon={closeDataPick}
          startIconIsClose
          title="Import a dataset"
        />
      )}
      {!mobileScreen && <DialogTitle>Import a dataset</DialogTitle>}
      <DialogContent className={classes.form}>
        {dataset && (
          <DatasetInfo
            project_id={dataset.id}
            dataset_path={dataset.dataset_path}
            setDataset={setDataset}
          />
        )}

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
          <Button
            onClick={() => {
              closeDataPickAndOpenSetup(dataset.id);
            }}
            // disabled={isLoading}
          >
            Configure
          </Button>
        </DialogActions>
      )}

      {!dataset && (
        <DialogActions>
          <Button
            onClick={closeDataPick}
            // disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportDataset);
