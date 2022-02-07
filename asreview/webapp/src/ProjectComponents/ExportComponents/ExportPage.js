import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
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

import { ActionsFeedbackBar, PageHeader } from "../../Components";
import { MouseOverPopover } from "../../StyledComponents/StyledPopover.js";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";
import "../../App.css";

const selectWidth = 310;

const PREFIX = "ExportPage";

const classes = {
  select: `${PREFIX}-select`,
  selectHeight: `${PREFIX}-select-height`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.select}`]: {
    width: selectWidth,
  },

  [`& .${classes.selectHeight}`]: {
    height: 86,
  },
}));

const ExportPage = (props) => {
  const queryClient = useQueryClient();

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

  const disableRIS = () => {
    return props.dataReader !== "ris-reader";
  };

  const disableExportButton = () => {
    return !file || !fileFormat || exporting;
  };

  const resetQueries = () => {
    queryClient.resetQueries(selectedQuery()[1]);
  };

  return (
    <Root aria-label="export page">
      <Fade in>
        <Box>
          <PageHeader
            header="Project export"
            mobileScreen={props.mobileScreen}
          />
          <Box className="main-page-body-wrapper">
            <Stack className="main-page-body" spacing={3}>
              <Box
                className="main-page-body-wrapper"
                component="form"
                noValidate
                autoComplete="off"
              >
                <Stack spacing={3}>
                  <FormControl
                    className={`${classes.select} ${classes.selectHeight}`}
                  >
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
                  {!file && (
                    <Box className={classes.selectHeight}>
                      <MouseOverPopover title="Select file before selecting file format">
                        <FormControl
                          className={classes.select}
                          disabled
                          variant="filled"
                        >
                          <InputLabel id="file-select-label">
                            File format
                          </InputLabel>
                          <Select
                            labelId="file-type-select-label"
                            id="file-type-select"
                            label="File format"
                            value=""
                          />
                        </FormControl>
                      </MouseOverPopover>
                    </Box>
                  )}
                  {file === "dataset" && (
                    <FormControl
                      className={`${classes.select} ${classes.selectHeight}`}
                    >
                      <InputLabel id="file-select-label">
                        File format
                      </InputLabel>
                      <Select
                        labelId="file-type-select-label"
                        id="file-type-select"
                        label="File format"
                        value={fileFormat}
                        onChange={handleFileFormat}
                        MenuProps={{
                          sx: { width: selectWidth },
                        }}
                      >
                        <MenuItem value="csv">CSV (UTF-8)</MenuItem>
                        <MenuItem value="tsv">TSV (UTF-8)</MenuItem>
                        <MenuItem value="xlsx">Excel</MenuItem>
                        {!disableRIS() && <MenuItem value="ris">RIS</MenuItem>}
                        {disableRIS() && (
                          <MenuItem value="ris" disabled={disableRIS()}>
                            <Box>
                              <Typography variant="subtitle1">RIS</Typography>
                              <Typography
                                variant="body2"
                                gutterBottom
                                sx={{
                                  color: "text.secondary",
                                  whiteSpace: "pre-line",
                                }}
                              >
                                Available only if you imported a RIS file when
                                creating the project
                              </Typography>
                            </Box>
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  )}
                  {file === "project" && (
                    <FormControl
                      className={classes.selectHeight}
                      disabled
                      variant="filled"
                    >
                      <InputLabel id="file-select-label">
                        File format
                      </InputLabel>
                      <Box>
                        <Select
                          className={classes.select}
                          labelId="file-type-select-label"
                          id="file-type-select"
                          label="File format"
                          value={fileFormat}
                        >
                          <MenuItem value="asreview">ASREVIEW</MenuItem>
                        </Select>
                        <FormHelperText>
                          Can be imported into ASReview LAB
                        </FormHelperText>
                      </Box>
                    </FormControl>
                  )}
                </Stack>
              </Box>
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
      {selectedQuery() && (
        <ActionsFeedbackBar
          feedback="Successfully exported the file"
          open={selectedQuery()[0].isSuccess}
          onClose={resetQueries}
        />
      )}
      {selectedQuery() && selectedQuery()[0].isError && (
        <ActionsFeedbackBar
          feedback={selectedQuery()[0].error?.message + " Please try again."}
          open={selectedQuery()[0].isError}
          onClose={resetQueries}
        />
      )}
    </Root>
  );
};

export default connect(mapStateToProps)(ExportPage);
