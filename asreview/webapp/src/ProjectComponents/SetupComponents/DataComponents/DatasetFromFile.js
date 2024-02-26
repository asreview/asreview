import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient, useQuery } from "react-query";
import { connect } from "react-redux";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Stack,
  Typography,
  Link,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FileUpload } from "@mui/icons-material";

import { InlineErrorHandler } from "../../../Components";

import { ProjectAPI } from "../../../api";
import { mapStateToProps, projectModes } from "../../../globals";

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

const DatasetFromFile = ({ project_id, mode, setDataset }) => {
  const [file, setFile] = React.useState(null);
  const [acceptedFileTypes, setAcceptedFileTypes] = React.useState("");

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
      } else {
        setFile(acceptedFiles[0]);
      }

      if (isCreatingProjectError) {
        resetAddDataset();
      }

      addDataset({
        mode: mode,
        file: acceptedFiles[0],
      });
    },
    [addDataset, isCreatingProjectError, resetAddDataset],
  );

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

  const {
    data: readers,
    error: fetchReadersError,
    isError: isFetchReadersError,
    isFetching: isFetchingReaders,
  } = useQuery(
    ["fetchDatasetReaders", { project_id: project_id }],
    ProjectAPI.fetchDatasetReaders,
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        let readerString = "";
        data["result"].forEach((reader) => {
          readerString += reader.extension + ",";
        });

        setAcceptedFileTypes(readerString);
      },
    },
  );

  return (
    <Root>
      <Box {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <Stack className={classes.root} spacing={2}>
          <ButtonBase disabled={isCreatingProject} disableRipple onClick={open}>
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
          <Typography>Drag and drop a dataset file to add</Typography>
          <Typography variant="secondary">Or click to select a file</Typography>
          <Typography variant="secondary">
            Accepted files: {acceptedFileTypes}
          </Typography>
          {mode !== projectModes.ORACLE && (
            <Typography variant="secondary">
              "The dataset should contain labels for each record. "
            </Typography>
          )}
          {isCreatingProject && <CircularProgress />}
          {isCreatingProjectError && (
            <InlineErrorHandler
              message={createProjectError?.message + " Please try again."}
            />
          )}
        </Stack>
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps, null)(DatasetFromFile);
