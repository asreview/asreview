import {
  Diversity3,
  Email,
  LibraryBooks,
  Payment,
  StarBorder,
} from "@mui/icons-material";
import {
  Box,
  Button,
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
import "App.css";
import { ActionsFeedbackBar, CiteDialog, PageHeader } from "Components";
import { MouseOverPopover } from "StyledComponents/StyledPopover";
import { ProjectAPI } from "api";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

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

const StyledActionsBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  flexDirection: "row", // Always set to row
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

  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleDialog = () => {
    setDialogOpen((prev) => !prev);
  };

  return (
    <Root aria-label="export page">
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
                    <InputLabel id="file-select-label">File format</InputLabel>
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
                            <Box>
                              <Typography
                                className="typography-wrap"
                                variant="subtitle1"
                              >
                                {value.label}
                              </Typography>
                              {!value.enabled
                                ? value.caution
                                : null && (
                                    <Typography
                                      className="typography-wrap"
                                      variant="body2"
                                      gutterBottom
                                      sx={{ color: "text.secondary" }}
                                    >
                                      {!value.enabled ? value.caution : null}
                                    </Typography>
                                  )}
                            </Box>
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
                    <InputLabel id="file-select-label">File format</InputLabel>
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
            <StyledActionsBox>
              <Box
                sx={{
                  maxWidth: { xs: "60%", sm: "40%", md: "30%" },
                  width: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", paddingBottom: "10px" }}
                >
                  Love using ASReview LAB?
                </Typography>
                <Stack
                  spacing={2}
                  sx={{
                    justifyContent: "center",
                    width: "164px",
                    margin: "auto",
                    textAlign: "center",
                  }}
                >
                  <Button
                    startIcon={<LibraryBooks />}
                    variant="outlined"
                    color="primary"
                    onClick={toggleDialog}
                  >
                    Cite
                  </Button>
                  <CiteDialog
                    isOpen={dialogOpen}
                    onClose={toggleDialog}
                    asreview_version={window.asreviewVersion}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://github.com/asreview/asreview"
                    startIcon={<StarBorder />}
                  >
                    Star
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://asreview.nl/donate"
                    startIcon={<Payment />}
                  >
                    Donate
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://asreview.ai/newsletter/subscribe"
                    startIcon={<Email />}
                  >
                    Subscribe
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    target="_blank"
                    href="https://asreview.nl/community"
                    startIcon={<Diversity3 />}
                  >
                    Contribute
                  </Button>
                </Stack>
              </Box>
            </StyledActionsBox>
          </Stack>
        </Box>
      </Box>
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

export default ExportPage;
