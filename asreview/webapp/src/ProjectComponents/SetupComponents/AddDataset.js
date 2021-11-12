import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  DialogContent,
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

import { InlineErrorHandler } from "../../Components";
import {
  DatasetFromBenchmark,
  DatasetFromExtension,
  DatasetFromFile,
  DatasetFromURL,
} from "../SetupComponents";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps, projectModes } from "../../globals.js";

const AddDataset = (props) => {
  const queryClient = useQueryClient();

  const { data, error, isError, isFetched, isSuccess } = useQuery(
    ["fetchData", { project_id: props.project_id }],
    ProjectAPI.fetchData,
    {
      enabled: props.datasetAdded,
      refetchOnWindowFocus: false,
    }
  );

  const refetchData = () => {
    queryClient.resetQueries("fetchData");
  };

  return (
    <Fade in>
      <DialogContent sx={{ padding: "24px 48px 48px 48px" }}>
        <Stack spacing={3}>
          {!props.isAddingDataset && isError && (
            <InlineErrorHandler
              message={error?.message}
              refetch={refetchData}
              button="Try to refresh"
            />
          )}
          {!props.isAddingDataset && !isError && isFetched && isSuccess && (
            <Typography variant="subtitle2">
              Dataset <i>{data?.filename}</i> with <i>{data?.n_rows}</i> records
              is added. Editing the dataset removes the prior knowledge.
            </Typography>
          )}
          <FormControl disabled={props.isAddingDataset} component="fieldset">
            <FormLabel component="legend">Add a dataset from</FormLabel>
            <RadioGroup
              row
              aria-label="dataset source"
              name="row-radio-buttons-group"
              value={props.datasetSource}
            >
              <FormControlLabel
                value="file"
                control={<Radio />}
                label="File"
                onChange={props.handleDatasetSource}
              />
              <FormControlLabel
                value="url"
                control={<Radio />}
                label="URL"
                onChange={props.handleDatasetSource}
              />
              {props.mode === projectModes.ORACLE && (
                <FormControlLabel
                  value="extension"
                  control={<Radio />}
                  label="Extension"
                  onChange={props.handleDatasetSource}
                />
              )}
              {props.mode === projectModes.EXPLORATION && (
                <FormControlLabel
                  value="benchmark"
                  control={<Radio />}
                  label="Benchmark datasets"
                  onChange={props.handleDatasetSource}
                />
              )}
            </RadioGroup>
          </FormControl>
          {(props.datasetSource === "file" ||
            props.datasetSource === "url") && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ASReview LAB accepts RIS file format (<code>.ris</code>,{" "}
              <code>.txt</code>) and tabular datasets (<code>.csv</code>,{" "}
              <code>.tab</code>, <code>.tsv</code>, <code>.xlsx</code>). The
              selected dataset should contain the title and abstract of each
              record.{" "}
              <Link
                underline="none"
                href="https://asreview.readthedocs.io/en/latest/intro/datasets.html"
                target="_blank"
              >
                Learn more
              </Link>
            </Typography>
          )}
          {props.datasetSource === "extension" && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ASReview dataset extensions provide collections of latest
              scientific datasets on a specific topic.{" "}
              <Link
                underline="none"
                href="https://asreview.readthedocs.io/en/latest/extensions/extension_covid19.html"
                target="_blank"
              >
                Learn more
              </Link>
            </Typography>
          )}
          {props.datasetSource === "benchmark" && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              The benchmark datasets were manually labeled and used to explore
              the performance of active learning models.{" "}
              <Link
                underline="none"
                href="https://asreview.readthedocs.io/en/latest/lab/exploration.html"
                target="_blank"
              >
                Learn more
              </Link>
            </Typography>
          )}
          {props.datasetSource === "file" && (
            <DatasetFromFile
              addDatasetError={props.addDatasetError}
              file={props.file}
              setFile={props.setFile}
              isAddDatasetError={props.isAddDatasetError}
              isAddingDataset={props.isAddingDataset}
              reset={props.reset}
            />
          )}
          {props.datasetSource === "url" && (
            <DatasetFromURL
              addDatasetError={props.addDatasetError}
              url={props.url}
              setURL={props.setURL}
              isAddDatasetError={props.isAddDatasetError}
              isAddingDataset={props.isAddingDataset}
              reset={props.reset}
            />
          )}
          {props.datasetSource === "extension" && (
            <DatasetFromExtension
              addDatasetError={props.addDatasetError}
              extension={props.extension}
              setExtension={props.setExtension}
              isAddDatasetError={props.isAddDatasetError}
              isAddingDataset={props.isAddingDataset}
              reset={props.reset}
            />
          )}
          {props.datasetSource === "benchmark" && (
            <DatasetFromBenchmark
              addDatasetError={props.addDatasetError}
              benchmark={props.benchmark}
              setBenchmark={props.setBenchmark}
              isAddDatasetError={props.isAddDatasetError}
              isAddingDataset={props.isAddingDataset}
              reset={props.reset}
            />
          )}
        </Stack>
      </DialogContent>
    </Fade>
  );
};

export default connect(mapStateToProps)(AddDataset);
