import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FileUpload } from "@mui/icons-material";

import { InlineErrorHandler } from "../Components";

import { ProjectAPI } from "../api/index.js";
import { mapStateToProps } from "../globals.js";

const PREFIX = "ImportFromFile";

const classes = {
  root: `${PREFIX}-root`,
  singleLine: `${PREFIX}-single-line`,
};

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  [`& .${classes.root}`]: {
    display: "flex",
    alignItems: "center",
  },

  [`& .${classes.singleLine}`]: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 1,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },
}));

const baseStyle = {
  height: "100%",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 20px 80px 20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const ImportFromFile = (props) => {
  const queryClient = useQueryClient();
  const [file, setFile] = React.useState(null);

  /**
   * Import a dataset.
   */
  const {
    error: addDatasetError,
    isError: isAddDatasetError,
    isLoading: isAddingDataset,
    mutate: addDataset,
    reset: resetAddDataset,
  } = useMutation(ProjectAPI.mutateData, {
    mutationKey: ["addDataset"],
    onSuccess: (data) => {
      props.toggleImportDataset();
      props.toggleProjectSetup();
    },
  });

  /**
   * Import a project.
   */
  const {
    error: importProjectError,
    isError: isImportProjectError,
    isLoading: isImportingProject,
    mutate: importProject,
    reset: resetImportProject,
  } = useMutation(ProjectAPI.mutateImportProject, {
    mutationKey: ["importProject"],
    onSuccess: (data) => {
      queryClient.invalidateQueries("fetchProjects");
      props.toggleImportProject();
      props.setFeedbackBar({
        open: data !== undefined,
        message: `Your project ${data?.name} has been imported`,
      });
    },
  });

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length !== 1) {
        console.log("No valid file provided");
        return;
      } else {
        setFile(acceptedFiles[0]);
      }

      // set error to state
      if (isAddDatasetError) {
        resetAddDataset();
      } else if (isImportProjectError) {
        resetImportProject();
      }

      // import the file
      if (props.acceptFormat !== ".asreview") {
        addDataset({
          project_id: props.project_id,
          file: acceptedFiles[0],
        });
      } else {
        importProject({
          file: acceptedFiles[0],
        });
      }
    },
    [
      props.project_id,
      props.acceptFormat,
      addDataset,
      isAddDatasetError,
      resetAddDataset,
      importProject,
      isImportProjectError,
      resetImportProject,
    ],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = useDropzone({
    onDrop: !(isAddingDataset || isImportingProject) ? onDrop : false,
    multiple: false,
    noClick: true,
    accept: props.acceptFormat,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept],
  );

  const returnAcceptFile = () => {
    if (props.acceptFormat !== ".asreview") {
      return <Typography>Drag and drop a dataset file to add</Typography>;
    } else {
      return (
        <Typography>
          Drag and drop a project file (<code>.asreview</code>) to add
        </Typography>
      );
    }
  };

  return (
    <Root>
      <Box {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <Stack className={classes.root} spacing={2}>
          <ButtonBase
            disabled={isAddingDataset || isImportingProject}
            disableRipple
            onClick={open}
          >
            <Avatar
              sx={{
                height: "136px",
                width: "136px",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              }}
            >
              <FileUpload
                sx={{ height: "65px", width: "65px", color: "grey.500" }}
              />
            </Avatar>
          </ButtonBase>
          {returnAcceptFile()}
          {file && (
            <Typography className={classes.singleLine}>
              File <i>{file?.path}</i> selected.
            </Typography>
          )}
          {isImportingProject && props.acceptFormat === ".asreview" && (
            <Typography sx={{ color: "text.secondary" }}>
              Importing...
            </Typography>
          )}
          {isAddingDataset && props.acceptFormat !== ".asreview" && (
            <Typography sx={{ color: "text.secondary" }}>Adding...</Typography>
          )}
          {isAddDatasetError && (
            <InlineErrorHandler
              message={addDatasetError?.message + " Please try again."}
            />
          )}
          {isImportProjectError && (
            <InlineErrorHandler
              message={importProjectError?.message + " Please try again."}
            />
          )}
          <Button
            disabled={isAddingDataset || isImportingProject}
            variant="contained"
            onClick={open}
          >
            Select File
          </Button>
        </Stack>
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps, null)(ImportFromFile);
