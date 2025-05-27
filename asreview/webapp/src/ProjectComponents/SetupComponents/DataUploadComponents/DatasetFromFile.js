import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery } from "react-query";

import { FileUpload } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  ButtonBase,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { ProjectAPI } from "api";
import { projectModes } from "globals.js";

const baseStyle = {
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  borderRadius: "12px",
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

const DatasetFromFile = ({ project_id, mode, setSetupProjectId }) => {
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const {
    error: createProjectError,
    isError: isCreatingProjectError,
    isLoading: isCreatingProject,
    mutate: addDataset,
    reset: resetAddDataset,
  } = useMutation(ProjectAPI.createProject, {
    mutationKey: ["addDataset"],
    onSuccess: (data) => {
      setSetupProjectId(data.id);
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

  const { data } = useQuery(
    ["fetchDatasetReaders", { project_id: project_id }],
    ProjectAPI.fetchDatasetReaders,
    {
      refetchOnWindowFocus: false,
    },
  );

  const acceptedFileTypes = data?.result
    ? data.result.reduce((acc, reader) => {
        Object.entries(reader.mime_types).forEach(([mime, exts]) => {
          if (!acc[mime]) acc[mime] = [];
          acc[mime].push(...exts);
        });
        return acc;
      }, {})
    : {};

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

  const style = {
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  };

  const acceptedExtensions = data?.result
    ? [
        ...new Set(
          data.result.flatMap((reader) =>
            Object.values(reader.mime_types).flat(),
          ),
        ),
      ].join(", ")
    : "";

  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <input {...getInputProps()} />

        <ButtonBase
          disabled={isCreatingProject}
          disableRipple
          onClick={open}
          sx={{
            height: "100%",
            width: "100%",
            py: 10,
          }}
        >
          <Stack spacing={2} justifyContent="center" direction={"column"}>
            <Box display="flex" justifyContent="center">
              {isCreatingProject ? (
                <CircularProgress />
              ) : (
                <Avatar>
                  <FileUpload fontSize="large" />
                </Avatar>
              )}
            </Box>
            <Typography fontSize="1.4rem">
              {mobileScreen
                ? "Upload dataset"
                : `Click or drop a ${
                    mode === projectModes.SIMULATION ? "fully labeled " : ""
                  }dataset here`}
            </Typography>
            <Typography fontSize="1rem">
              Accepted files: {acceptedExtensions}
            </Typography>

            {isCreatingProjectError && (
              <Box>
                <Alert severity="error" sx={{ mx: 3 }}>
                  {createProjectError?.message}
                </Alert>
              </Box>
            )}
          </Stack>
        </ButtonBase>
      </Paper>
    </Stack>
  );
};

export default DatasetFromFile;
