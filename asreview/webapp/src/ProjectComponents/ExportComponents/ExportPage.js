import * as React from "react";
import { useQuery } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Fade,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { PageHeader, SnackbarErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";
import "../../App.css";

const PREFIX = "ExportPage";

const classes = {
  select: `${PREFIX}-select`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.select}`]: {
    minWidth: 310,
  },
}));

const ExportPage = (props) => {
  const [file, setFile] = React.useState("");
  const [fileFormat, setFileFormat] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  const exportDatasetQuery = useQuery(
    ["fetchExportDataset", { project_id: props.project_id, fileFormat }],
    ProjectAPI.fetchExportDataset,
    {
      enabled: file === "dataset" && exporting,
      refetchOnWindowFocus: false,
      onSettled: () => setExporting(false),
    }
  );

  const exportProjectQuery = useQuery(
    ["fetchExportProject", { project_id: props.project_id }],
    ProjectAPI.fetchExportProject,
    {
      enabled: file === "project" && exporting,
      refetchOnWindowFocus: false,
      onSettled: () => setExporting(false),
    }
  );

  const selectedQuery = () => {
    if (file === "dataset") {
      return [exportDatasetQuery, "fetchExportDataset"];
    }
    if (file === "project") {
      return [exportProjectQuery, "fetchExportProject"];
    }
  };

  const handleFile = (event) => {
    setFile(event.target.value);
    if (event.target.value === "project") {
      setFileFormat("asreview");
    } else {
      setFileFormat("");
    }
  };

  const handleFileFormat = (event) => {
    setFileFormat(event.target.value);
  };

  const onClickExport = () => {
    setExporting(true);
  };

  const disableExportButton = () => {
    return !file || !fileFormat || exporting;
  };

  return (
    <Root aria-label="export page">
      {selectedQuery() && (
        <SnackbarErrorHandler
          severity="error"
          open={selectedQuery()[0].isError}
          message={`${selectedQuery()[0].error?.message} Please try again.`}
          queryKey={selectedQuery()[1]}
        />
      )}
      {selectedQuery() && (
        <SnackbarErrorHandler
          severity="success"
          open={selectedQuery()[0].isSuccess}
          message="Successfully exported the file."
          queryKey={selectedQuery()[1]}
        />
      )}
      <Fade in>
        <Box>
          <PageHeader
            header="Project export"
            mobileScreen={props.mobileScreen}
          />
          <Box className="main-page-body-wrapper">
            <Stack className="main-page-body" spacing={5}>
              <Stack className={classes.select} spacing={5}>
                <FormControl sx={{ height: 86 }}>
                  {!file && (
                    <InputLabel id="file-select-label" shrink={false}>
                      Select file
                    </InputLabel>
                  )}
                  <Select
                    labelId="file-select-label"
                    id="file-select"
                    value={file}
                    onChange={handleFile}
                  >
                    <MenuItem
                      value="dataset"
                      disabled={!props.enableExportDataset}
                      divider
                    >
                      <Box>
                        <Typography variant="subtitle1">Dataset</Typography>
                        <Typography
                          variant="body2"
                          gutterBottom
                          sx={{ color: "text.secondary" }}
                        >
                          With relevant/irrelevant labels
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="project">
                      <Box>
                        <Typography variant="subtitle1">Project</Typography>
                        <Typography
                          variant="body2"
                          gutterBottom
                          sx={{ color: "text.secondary" }}
                        >
                          Including data and model configuration
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ height: 78 }}>
                  <InputLabel id="file-select-label">File format</InputLabel>
                  {!file && (
                    <Select
                      disabled
                      labelId="file-type-select-label"
                      id="file-type-select"
                      label="File format"
                      value=""
                    />
                  )}
                  {file === "dataset" && (
                    <Select
                      labelId="file-type-select-label"
                      id="file-type-select"
                      label="File format"
                      value={fileFormat}
                      onChange={handleFileFormat}
                    >
                      <MenuItem value="ris">RIS (UTF-8)</MenuItem>
                      <MenuItem value="csv">CSV (UTF-8)</MenuItem>
                      <MenuItem value="tsv">TSV (UTF-8)</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                    </Select>
                  )}
                  {file === "project" && (
                    <Box>
                      <Select
                        disabled
                        labelId="file-type-select-label"
                        id="file-type-select"
                        label="File format"
                        value={fileFormat}
                        sx={{ width: "100%" }}
                      >
                        <MenuItem value="asreview">ASREVIEW</MenuItem>
                      </Select>
                      <FormHelperText>
                        Can be imported into ASReview LAB
                      </FormHelperText>
                    </Box>
                  )}
                </FormControl>
              </Stack>
              <Box className="main-page-body-wrapper">
                <Button
                  disabled={disableExportButton()}
                  onClick={onClickExport}
                >
                  {!exporting ? "Export" : "Exporting..."}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Root>
  );
};

export default connect(mapStateToProps)(ExportPage);
