import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Fade,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ActionsFeedbackBar, PageHeader } from "../../Components";
import { SelectItem } from "../../ProjectComponents";

import { MouseOverPopover } from "../../StyledComponents/StyledPopover.js";
import { ProjectAPI } from "../../api/index.js";
import "../../App.css";
import { TypographySubtitle1Medium } from "../../StyledComponents/StyledTypography.js";

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
  const { project_id } = useParams();

  const queryClient = useQueryClient();

  const [file, setFile] = React.useState("");
  const [fileFormat, setFileFormat] = React.useState("");
  const [exporting, setExporting] = React.useState(false);
  const [datasetLabel, setDatasetLabel] = React.useState("all");

  const { data, error, isError, isFetching } = useQuery(
    ["fetchDatasetWriter", { project_id }],
    ProjectAPI.fetchDatasetWriter,
    {
      refetchOnWindowFocus: false,
    },
  );

  const exportDatasetQuery = useQuery(
    [
      "fetchExportDataset",
      {
        project_id,
        project_title: props.info["name"],
        datasetLabel,
        fileFormat,
      },
    ],
    ProjectAPI.fetchExportDataset,
    {
      enabled: (file === "dataset" || file === "dataset_relevant") && exporting,
      refetchOnWindowFocus: false,
      onSettled: () => setExporting(false),
    },
  );

  const exportProjectQuery = useQuery(
    ["fetchExportProject", { project_id, project_title: props.info["name"] }],
    ProjectAPI.fetchExportProject,
    {
      enabled: file === "project" && exporting,
      refetchOnWindowFocus: false,
      onSettled: () => setExporting(false),
    },
  );

  const selectedQuery = () => {
    if (file === "dataset" || file === "dataset_relevant") {
      return [exportDatasetQuery, "fetchExportDataset"];
    }
    if (file === "project") {
      return [exportProjectQuery, "fetchExportProject"];
    }
  };

  const handleFile = (event) => {
    setFile(event.target.value);
    if (event.target.value === "dataset_relevant") {
      setDatasetLabel("relevant");
    }
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
    return !file || !fileFormat || exporting || props.isSimulating;
  };

  const resetQueries = () => {
    queryClient.resetQueries(selectedQuery()[1]);
  };

  const refetchDatasetWriter = () => {
    queryClient.resetQueries("fetchDatasetWriter");
  };

  return (
    <Root aria-label="export page">
      <Fade in>
        <Box>
          <PageHeader header="Export" mobileScreen={props.mobileScreen} />
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
                      <MenuItem value="dataset" divider>
                        <Box>
                          <Typography variant="subtitle1">Dataset</Typography>
                          <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ color: "text.secondary" }}
                          >
                            Including all labeled and unlabeled records
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="dataset_relevant" divider>
                        <Box>
                          <Typography variant="subtitle1">
                            Dataset (relevant only)
                          </Typography>
                          <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ color: "text.secondary" }}
                          >
                            Including relevant records only
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
                  {(file === "dataset" || file === "dataset_relevant") && (
                    <FormControl
                      className={`${classes.select} ${classes.selectHeight}`}
                      disabled={isError || isFetching}
                      error={isError}
                      variant={isError || isFetching ? "filled" : "outlined"}
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
                        {data?.result.map((value, index) => {
                          return (
                            <MenuItem
                              key={index}
                              value={value.name}
                              disabled={!value.enabled}
                            >
                              <SelectItem
                                primary={value.label}
                                secondary={
                                  !value.enabled ? value.caution : null
                                }
                              />
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {isError && (
                        <FormHelperText>
                          {error.message}
                          <Link
                            component="button"
                            variant="body2"
                            onClick={refetchDatasetWriter}
                          >
                            Please try again
                          </Link>
                        </FormHelperText>
                      )}
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
                <Tooltip
                  disableFocusListener={!props.isSimulating}
                  disableHoverListener={!props.isSimulating}
                  disableTouchListener={!props.isSimulating}
                  title="Export after simulation is finished"
                >
                  <span>
                    <Button
                      disabled={disableExportButton()}
                      onClick={onClickExport}
                    >
                      {!exporting ? "Export" : "Exporting..."}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
              .
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%" // This ensures the container takes the full height of its parent
              >
                <Box
                  border={2}
                  borderColor="info.main"
                  borderRadius={3}
                  padding={2}
                  bgcolor="info.lighter"
                  maxWidth="600px" // or whatever maximum width you prefer
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Love using ASReview? Here's how you can give back to our
                    open-source and community-driven project:
                  </Typography>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    - <strong>Cite Us:</strong> If you find ASReview useful for
                    your research, please consider citing the project: ASReview
                    LAB developers. (2023). ASReview LAB - A tool for
                    AI-assisted systematic reviews (v{props.asreview_version}).
                    Zenodo.
                    <Link href="https://doi.org/10.5281/zenodo.8297019">
                      https://doi.org/10.5281/zenodo.8297019
                    </Link>
                  </Typography>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    - <strong>Discuss:</strong> Share your insights and join the
                    conversation on our{" "}
                    <a
                      href="https://github.com/asreview/asreview/discussions"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      discussion platform
                    </a>
                    .
                  </Typography>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    - <strong>Donate:</strong> Support our research and
                    development by donating through the{" "}
                    <a
                      href="https://steun.uu.nl/project/asreview"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Utrecht University crowdfunding platform
                    </a>
                    .
                  </Typography>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    - <strong>Become a Contributor:</strong> Help us improve the
                    code by contributing to our{" "}
                    <a
                      href="https://github.com/asreview/asreview"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub repository
                    </a>
                    .
                  </Typography>
                </Box>
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

const mapStateToProps = (state) => {
  return {
    asreview_version: state.asreview_version,
  };
};

export default connect(mapStateToProps)(ExportPage);
