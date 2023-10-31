import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  Button,
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
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { AppBarWithinDialog } from "../../../Components";
import { DatasetFromEntryPoint, DatasetFromURL } from "../DataComponents";
import { InfoCard } from "../../SetupComponents";
import { ImportFromFile } from "../../../ProjectComponents";
import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps, projectModes } from "../../../globals.js";

const PREFIX = "AddDataset";

const classes = {
  root: `${PREFIX}-root`,
  form: `${PREFIX}-form`,
};

const Root = styled("div")(({ theme }) => ({
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

const AddDataset = (props) => {
  const queryClient = useQueryClient();

  const [datasetSource, setDatasetSource] = React.useState("file");
  const [file, setFile] = React.useState(null);
  const [url, setURL] = React.useState("");
  const [extension, setExtension] = React.useState(null);
  const [benchmark, setBenchmark] = React.useState(null);

  const { error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateData,
    {
      onSettled: () => {
        props.setDisableFetchInfo(false);
        queryClient.invalidateQueries("fetchInfo");
      },
      onSuccess: () => {
        queryClient.invalidateQueries("fetchLabeledStats");
        props.toggleAddDataset();
      },
    },
  );

  const handleDatasetSource = (event) => {
    setDatasetSource(event.target.value);
    // clear potential error
    reset();
  };

  const handleSaveDataset = React.useCallback(() => {
    mutate({
      project_id: props.project_id,
      file: file,
      url: url,
      extension: extension,
      benchmark: benchmark,
    });
  }, [benchmark, extension, file, mutate, props.project_id, url]);

  const handleClose = () => {
    props.toggleAddDataset();
    // clear potential error
    reset();
  };

  React.useEffect(() => {
    if (props.mode === projectModes.EXPLORATION) {
      setDatasetSource("benchmark");
    }
    if (props.mode !== projectModes.EXPLORATION) {
      setDatasetSource("file");
    }
  }, [props.mode]);

  // auto import once dataset is selected
  React.useEffect(() => {
    if (file || extension || benchmark) {
      handleSaveDataset();
    }
  }, [handleSaveDataset, file, benchmark, extension]);

  return (
    <Root>
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
            <DialogTitle>Dataset</DialogTitle>
            <Box className="dialog-header-button right">
              <Button disabled={isLoading} onClick={handleClose}>
                Close
              </Button>
            </Box>
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
                {props.mode === projectModes.ORACLE && (
                  <FormControlLabel
                    value="extension"
                    control={<Radio />}
                    label="Extension"
                    onChange={handleDatasetSource}
                  />
                )}
                {(props.mode === projectModes.EXPLORATION ||
                  props.mode === projectModes.SIMULATION) && (
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
                {props.mode !== projectModes.ORACLE
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
                  href="https://asreview.readthedocs.io/en/latest/extensions/overview_extensions.html"
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
              <ImportFromFile
                acceptFormat=".txt,.tsv,.tab,.csv,.ris,.xlsx"
                addFileError={error}
                file={file}
                setFile={setFile}
                isAddFileError={isError}
                isAddingFile={isLoading}
                reset={reset}
              />
            )}
            {datasetSource === "url" && (
              <DatasetFromURL
                project_id={props.project_id}
                addDatasetError={error}
                handleSaveDataset={handleSaveDataset}
                url={url}
                setURL={setURL}
                isAddDatasetError={isError}
                isAddingDataset={isLoading}
                reset={reset}
              />
            )}
            {datasetSource === "extension" && (
              <DatasetFromEntryPoint
                subset="plugin"
                addDatasetError={error}
                extension={extension}
                setExtension={setExtension}
                isAddDatasetError={isError}
                isAddingDataset={isLoading}
                mobileScreen={props.mobileScreen}
                reset={reset}
              />
            )}
            {datasetSource === "benchmark" && (
              <DatasetFromEntryPoint
                subset="benchmark"
                addDatasetError={error}
                benchmark={benchmark}
                setBenchmark={setBenchmark}
                isAddDatasetError={isError}
                isAddingDataset={isLoading}
                mobileScreen={props.mobileScreen}
                reset={reset}
              />
            )}
          </Stack>
        </DialogContent>
      </Fade>
    </Root>
  );
};

export default connect(mapStateToProps)(AddDataset);
