import * as React from "react";
import { useIsMutating, useMutation, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Dialog,
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
import { StyledIconButton } from "../../../StyledComponents/StyledButton.js";
import { DatasetFromFile, DatasetFromEntryPoint, DatasetFromURL } from ".";
import { InfoCard } from "..";
import { ProjectAPI } from "../../../api/index.js";
import {
  mapDispatchToProps,
  mapStateToProps,
  projectModes,
} from "../../../globals.js";

const PREFIX = "ImportDataset";

const classes = {
  root: `${PREFIX}-root`,
  form: `${PREFIX}-form`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  overflowY: "hidden",
  [`& .${classes.form}`]: {
    height: "calc(100% - 64px)",
    overflowY: "scroll",
    padding: "24px 48px 48px 48px",
    [theme.breakpoints.down("md")]: {
      height: "calc(100% - 56px)",
      padding: "32px 24px 48px 24px",
    },
  },
}));

const ImportDataset = (props) => {
  const queryClient = useQueryClient();

  const [projectInfo, setProjectInfo] = React.useState(null);
  const [datasetSource, setDatasetSource] = React.useState("file");

  const datasetInfo = queryClient.getQueryData([
    "fetchData",
    { project_id: props.project_id },
  ]);

  const isAddingDataset = useIsMutating(["addDataset"]);

  const isLoading = isAddingDataset !== 0;

  const isDatasetAdded = () => {
    return datasetInfo !== undefined;
  };

  /**
   * Delete the temporary project.
   */
  const {
    // TODO{Terry}: add error handling
    // error: deleteProjectError,
    // isError: isDeleteProjectError,
    // isLoading: isDeletingProject,
    mutate: deleteProject,
    // reset: resetDeleteProject,
  } = useMutation(ProjectAPI.mutateDeleteProject, {
    onSuccess: () => {
      props.toggleImportDataset();
    },
  });

  const handleDatasetSource = (event) => {
    setDatasetSource(event.target.value);
  };

  const handleClose = () => {
    if (!isDatasetAdded()) {
      // Delete the temporary project when the dialog is closed.
      deleteProject({
        project_id: props.project_id,
      });
    } else {
      props.toggleImportDataset();
    }
  };

  const onExited = () => {
    setProjectInfo(null);
    setDatasetSource("file");
  };

  // fetch project info once the dialog is opened
  React.useEffect(() => {
    const fetchInfo = async () => {
      const projectInfo = await queryClient.fetchQuery(
        ["fetchInfo", { project_id: props.project_id }],
        ProjectAPI.fetchInfo,
      );
      setProjectInfo(projectInfo);
    };
    if (props.open && props.project_id !== null) {
      fetchInfo();
    }
  }, [props.open, props.project_id, queryClient]);

  // set the data source to benchmark when exploration mode is selected
  React.useEffect(() => {
    if (projectInfo?.mode === projectModes.EXPLORATION) {
      setDatasetSource("benchmark");
    }
    if (projectInfo?.mode !== projectModes.EXPLORATION) {
      setDatasetSource("file");
    }
  }, [projectInfo?.mode]);

  return (
    <StyledDialog
      open={props.open}
      fullScreen={props.mobileScreen}
      fullWidth
      hideBackdrop={isDatasetAdded()}
      maxWidth="md"
      PaperProps={{
        elevation: !props.datasetAdded ? 1 : 0,
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      TransitionProps={{ onExited: onExited }}
    >
      {props.mobileScreen && (
        <AppBarWithinDialog
          disableStartIcon={isLoading}
          onClickStartIcon={handleClose}
          startIconIsClose={false}
          title="Dataset"
        />
      )}
      {!props.mobileScreen && (
        <Fade in>
          <Stack className="dialog-header" direction="row">
            <DialogTitle>Import Dataset</DialogTitle>
            <Stack
              className="dialog-header-button right"
              direction="row"
              spacing={1}
            >
              <Tooltip title="Close">
                <StyledIconButton disabled={isLoading} onClick={handleClose}>
                  <Close />
                </StyledIconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Fade>
      )}
      <Divider />
      <Fade in>
        <DialogContent className={classes.form}>
          <Stack spacing={3}>
            {props.datasetAdded && (
              <InfoCard info="Editing dataset removes the added prior knowledge" />
            )}
            <FormControl disabled={isLoading} component="fieldset">
              <FormLabel component="legend">Add a dataset from</FormLabel>
              <RadioGroup
                row
                aria-label="dataset source"
                name="row-radio-buttons-group"
                value={datasetSource}
              >
                <FormControlLabel
                  value="file"
                  control={<Radio />}
                  label="File"
                  onChange={handleDatasetSource}
                />
                <FormControlLabel
                  value="url"
                  control={<Radio />}
                  label="URL or DOI"
                  onChange={handleDatasetSource}
                />
                {projectInfo?.mode === projectModes.ORACLE && (
                  <FormControlLabel
                    value="extension"
                    control={<Radio />}
                    label="Extension"
                    onChange={handleDatasetSource}
                  />
                )}
                {(projectInfo?.mode === projectModes.EXPLORATION ||
                  projectInfo?.mode === projectModes.SIMULATION) && (
                  <FormControlLabel
                    value="benchmark"
                    control={<Radio />}
                    label="Benchmark datasets"
                    onChange={handleDatasetSource}
                  />
                )}
              </RadioGroup>
            </FormControl>
            {(datasetSource === "file" || datasetSource === "url") && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Supported formats are RIS (<code>.ris</code>, <code>.txt</code>)
                and tabular datasets (<code>.csv</code>, <code>.tab</code>,{" "}
                <code>.tsv</code>, <code>.xlsx</code>). The dataset should
                contain a title and abstract for each record.{" "}
                {projectInfo?.mode !== projectModes.ORACLE
                  ? "The dataset should contain labels for each record. "
                  : ""}
                To optimally benefit from the performance of the active learning
                model, it is highly recommended to add a dataset without
                duplicate records and complete records.{" "}
                <Link
                  underline="none"
                  href="https://asreview.readthedocs.io/en/latest/intro/datasets.html"
                  target="_blank"
                >
                  Learn more
                </Link>
              </Typography>
            )}
            {datasetSource === "extension" && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Select a dataset from an extension.{" "}
                <Link
                  underline="none"
                  href="https://asreview.readthedocs.io/en/latest/extensions_dev.html"
                  target="_blank"
                >
                  Learn more
                </Link>
              </Typography>
            )}
            {datasetSource === "benchmark" && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                The benchmark datasets were manually labeled and can be used to
                explore or demonstrate ASReview LAB. You can donate your dataset
                to the benchmark platform.{" "}
                <Link
                  underline="none"
                  href="https://github.com/asreview/synergy-dataset"
                  target="_blank"
                >
                  Learn more
                </Link>
              </Typography>
            )}
            {datasetSource === "file" && (
              <DatasetFromFile
                acceptFormat=".txt,.tsv,.tab,.csv,.ris,.xlsx"
                toggleImportDataset={props.toggleImportDataset}
                toggleProjectSetup={props.toggleProjectSetup}
              />
            )}
            {datasetSource === "url" && (
              <DatasetFromURL
                toggleImportDataset={props.toggleImportDataset}
                toggleProjectSetup={props.toggleProjectSetup}
              />
            )}
            {datasetSource === "extension" && (
              <DatasetFromEntryPoint
                subset="plugin"
                mobileScreen={props.mobileScreen}
                toggleImportDataset={props.toggleImportDataset}
                toggleProjectSetup={props.toggleProjectSetup}
              />
            )}
            {datasetSource === "benchmark" && (
              <DatasetFromEntryPoint
                subset="benchmark"
                mobileScreen={props.mobileScreen}
                toggleImportDataset={props.toggleImportDataset}
                toggleProjectSetup={props.toggleProjectSetup}
              />
            )}
          </Stack>
        </DialogContent>
      </Fade>
    </StyledDialog>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ImportDataset);
