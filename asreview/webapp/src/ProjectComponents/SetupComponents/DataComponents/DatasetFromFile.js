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

import { InlineErrorHandler } from "../../../Components";

import { ProjectAPI } from "../../../api";
import { mapStateToProps } from "../../../globals";

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

const DatasetFromFile = (props) => {
  const queryClient = useQueryClient();

  const [file, setFile] = React.useState(null);

  const datasetInfo = queryClient.getQueryData([
    "fetchData",
    { project_id: props.project_id },
  ]);

  const {
    error: addDatasetError,
    isError: isAddDatasetError,
    isLoading: isAddingDataset,
    mutate: addDataset,
    reset: resetAddDataset,
  } = useMutation(ProjectAPI.mutateData, {
    mutationKey: ["addDataset"],
    onSuccess: (data) => {
      props.closeDataPickAndOpenSetup(props.project_id);
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

      if (isAddDatasetError) {
        resetAddDataset();
      }

      addDataset({
        project_id: props.project_id,
        file: acceptedFiles[0],
      });
    },
    [props.project_id, addDataset, isAddDatasetError, resetAddDataset],
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

  return (
    <Root>
      <Box {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <Stack className={classes.root} spacing={2}>
          <ButtonBase disabled={isAddingDataset} disableRipple onClick={open}>
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
          {file && (
            <Typography className={classes.singleLine}>
              File <i>{file?.path}</i> selected.
            </Typography>
          )}
          {isAddingDataset && (
            <Typography sx={{ color: "text.secondary" }}>Adding...</Typography>
          )}
          {isAddDatasetError && (
            <InlineErrorHandler
              message={addDatasetError?.message + " Please try again."}
            />
          )}
          <Button disabled={isAddingDataset} variant="contained" onClick={open}>
            Select File
          </Button>
        </Stack>
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps, null)(DatasetFromFile);
