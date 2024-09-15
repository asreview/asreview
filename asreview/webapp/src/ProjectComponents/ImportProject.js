import { Close, FileUpload } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "react-query";

import { InlineErrorHandler } from "Components";

import { ProjectAPI } from "api";

import { StyledIconButton } from "StyledComponents/StyledButton";
import { useToggle } from "hooks/useToggle";

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

const ImportProject = ({
  onImportProject,
  mobileScreen,
  toggleImportProject,
}) => {
  // const isImportingProject = useIsMutating(["importProject"]);
  const queryClient = useQueryClient();
  const [file, setFile] = React.useState(null);

  const [importSnackbar, toggleImportSnackbar] = useToggle(false);
  const [openWarnings, toggleOpenWarnings] = useToggle(false);

  const {
    error,
    isError,
    isLoading,
    mutate: importProject,
    data,
    reset,
  } = useMutation(ProjectAPI.mutateImportProject, {
    mutationKey: ["importProject"],
    onSuccess: (data) => {
      queryClient.invalidateQueries("fetchProjects");
      toggleImportProject();
      toggleImportSnackbar();

      if (data?.warnings.length > 0) {
        toggleOpenWarnings();
      }
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

      if (isError) {
        reset();
      }

      importProject({
        file: acceptedFiles[0],
      });
    },
    [importProject, isError, reset],
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
    accept: ".asreview",
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
    <>
      <Dialog
        open={onImportProject}
        fullScreen={mobileScreen}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { height: !mobileScreen ? "calc(100% - 96px)" : "100%" },
        }}
      >
        <Stack className="dialog-header" direction="row" spacing={1}>
          <DialogTitle>Import project</DialogTitle>
          <Stack
            className="dialog-header-button right"
            direction="row"
            spacing={1}
          >
            <Tooltip title="Close">
              <StyledIconButton
                disabled={isLoading}
                onClick={toggleImportProject}
              >
                <Close />
              </StyledIconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <DialogContent dividers>
          <Root>
            <Box {...getRootProps({ style })}>
              <input {...getInputProps()} />
              <Stack className={classes.root} spacing={2}>
                <ButtonBase disabled={isLoading} disableRipple onClick={open}>
                  <Avatar
                    sx={(theme) => ({
                      height: "136px",
                      width: "136px",
                      bgcolor: "grey.100",
                      ...theme.applyStyles("dark", {
                        bgcolor: "grey.800",
                      }),
                    })}
                  >
                    <FileUpload
                      sx={{ height: "65px", width: "65px", color: "grey.500" }}
                    />
                  </Avatar>
                </ButtonBase>
                <Typography>
                  Click or Drag and drop a ASReview file (<code>.asreview</code>
                  )
                </Typography>
                {file && (
                  <Typography className={classes.singleLine}>
                    File <i>{file?.path}</i> selected.
                  </Typography>
                )}
                {isLoading && (
                  <Typography sx={{ color: "text.secondary" }}>
                    Importing...
                  </Typography>
                )}
                {isError && (
                  <InlineErrorHandler
                    message={error?.message + " Please try again."}
                  />
                )}
              </Stack>
            </Box>
          </Root>
        </DialogContent>
      </Dialog>
      <Dialog open={openWarnings} onClose={toggleOpenWarnings}>
        <DialogTitle>Imported with warnings</DialogTitle>
        <DialogContent>
          <Typography>
            The project has been imported successfully, but with the following
            warnings:
          </Typography>
          {data?.warnings.map((item, i) => (
            <Alert key={i} severity="warning" sx={{ mt: 2 }}>
              {item}
            </Alert>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOpenWarnings} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={importSnackbar}
        onClose={toggleImportSnackbar}
        autoHideDuration={5000}
        message={`Your project has been imported`}
      />
    </>
  );
};

export default ImportProject;
