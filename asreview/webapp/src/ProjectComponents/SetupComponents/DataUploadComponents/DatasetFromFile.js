import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery } from "react-query";
import { connect } from "react-redux";
import {
  Avatar,
  Alert,
  Box,
  ButtonBase,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FileUpload } from "@mui/icons-material";

import { ProjectAPI } from "api";
import { mapStateToProps, projectModes } from "globals.js";

const PREFIX = "DatasetFromFile";

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
    height: "100%",
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
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#a7a9df",
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

const DatasetFromFile = ({ project_id, mode, setDataset }) => {
  const {
    error: createProjectError,
    isError: isCreatingProjectError,
    isLoading: isCreatingProject,
    mutate: addDataset,
    reset: resetAddDataset,
  } = useMutation(ProjectAPI.createProject, {
    mutationKey: ["addDataset"],
    onSuccess: (data) => {
      setDataset(data);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length !== 1) {
        console.log("No valid file provided");
        return;
      }

      if (isCreatingProjectError) {
        resetAddDataset();
      }

      addDataset({
        mode: mode,
        file: acceptedFiles[0],
      });
    },
    [addDataset, mode, isCreatingProjectError, resetAddDataset],
  );

  const {
    data: readers,
    // error: fetchReadersError,
    // isError: isFetchReadersError,
    // isFetching: isFetchingReaders,
  } = useQuery(
    ["fetchDatasetReaders", { project_id: project_id }],
    ProjectAPI.fetchDatasetReaders,
    {
      refetchOnWindowFocus: false,
    },
  );

  let acceptedFileTypes = "";
  readers?.result.forEach((reader) => {
    acceptedFileTypes += reader.extension + ", ";
  });

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = useDropzone({
    onDrop: onDrop,
    multiple: false,
    noClick: true,
    accept: acceptedFileTypes,
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

  return (
    <Root>
      <Box {...getRootProps({ style })}>
        <input {...getInputProps()} />

        <ButtonBase
          disabled={isCreatingProject}
          disableRipple
          onClick={open}
          sx={{ height: "100%", width: "100%" }}
        >
          <Stack className={classes.root} spacing={2} justifyContent={"center"}>
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
            <Typography>Drag and drop a dataset file or click</Typography>
            <Typography variant="secondary">
              Accepted files: {acceptedFileTypes}
            </Typography>
            {mode !== projectModes.ORACLE && (
              <Typography variant="secondary">
                "The dataset should contain labels for each record. "
              </Typography>
            )}
          </Stack>
        </ButtonBase>

        {isCreatingProject && <CircularProgress />}
        {isCreatingProjectError && (
          <Alert severity="error">{createProjectError?.message + "."}</Alert>
        )}
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps, null)(DatasetFromFile);
