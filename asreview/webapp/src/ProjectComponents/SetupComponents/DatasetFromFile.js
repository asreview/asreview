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
import { styled, useTheme } from "@mui/material/styles";
import { FileUpload, Warning } from "@mui/icons-material";

const PREFIX = "DatasetFromFile";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: "flex",
    alignItems: "center",
  },
}));

const baseStyle = {
  height: 416,
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
  const theme = useTheme();
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
        <Stack className={classes.root} spacing={3}>
          <ButtonBase disabled={isAddingDataset} disableRipple onClick={open}>
            <Avatar
              sx={{
                height: "136px",
                width: "136px",
                bgcolor:
                  theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              }}
            >
              <FileUpload
                sx={{ height: "65px", width: "65px", color: "grey.500" }}
              />
            </Avatar>
          </ButtonBase>
          <Typography>Drag and drop a dataset file to import</Typography>
          {file && (
            <Typography>
              File <i>{file?.path}</i> selected.
            </Typography>
          )}
          {isAddDatasetError && (
            <Stack direction="row" spacing={1}>
              <Warning color="error" fontSize="small" />
              <Typography variant="body2">
                {addDatasetError?.message} Please try again.
              </Typography>
            </Stack>
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
