import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
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

import { InlineErrorHandler } from "../../Components";

const PREFIX = "DatasetFromFile";

const classes = {
  root: `${PREFIX}-root`,
  singleLine: `${PREFIX}-single-line`,
};

const Root = styled("div")(({ theme }) => ({
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
  height: 400,
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "75px 20px 45px 20px",
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

const DatasetFromFile = ({
  addDatasetError,
  file,
  setFile,
  isAddDatasetError,
  isAddingDataset,
  reset,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length !== 1) {
        console.log("No valid files provided.");
        return;
      }

      // set error to state
      if (isAddDatasetError) {
        reset();
      }
      // set the state such that we ca upload the file
      setFile(acceptedFiles[0]);
    },
    [setFile, isAddDatasetError, reset]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = useDropzone({
    onDrop: !isAddingDataset ? onDrop : false,
    multiple: false,
    noClick: true,
    accept: ".txt,.tsv,.tab,.csv,.ris,.xlsx",
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
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

export default DatasetFromFile;
