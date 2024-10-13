import { FileUpload, FileUploadOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Popper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "react-query";

import { useMediaQuery } from "@mui/material";

import { ProjectAPI } from "api";

import { ResponsiveButton } from "StyledComponents/StyledResponsiveButton";
import { useToggle } from "hooks/useToggle";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const PREFIX = "ImportFromFile";

const classes = {
  root: `${PREFIX}-root`,
  singleLine: `${PREFIX}-single-line`,
};

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

const ImportProjectCard = ({ onClose = null, mutate, isLoading }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      mutate({
        file: acceptedFiles[0],
      });
    },
    [mutate],
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
    accept: {
      "application/zip": [".asreview"],
    },
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
    <Card
      // sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
      elevation={4}
    >
      <CardContent>
        <Box
          {...getRootProps({ style })}
          sx={{ height: "500px", width: "500px" }}
        >
          <input {...getInputProps()} />
          <Stack className={classes.root} spacing={2}>
            <ButtonBase disabled={isLoading} disableRipple onClick={open}>
              <FileUpload sx={{ height: "65px", width: "65px" }} />
            </ButtonBase>
            <Typography>
              {isLoading
                ? "Importing..."
                : "Click or Drag and drop a ASReview file (.asreview) here"}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

const ImportProject = ({ ...buttonProps }) => {
  const queryClient = useQueryClient();

  const smallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [importSnackbar, toggleImportSnackbar] = useToggle();
  const [warningDialog, toggleWarningDialog] = useToggle();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const toggleImportProject = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const onImportProject = Boolean(anchorEl);
  const id = onImportProject ? "import-popper" : undefined;

  const { mutate, isLoading, data, reset } = useMutation(
    ProjectAPI.mutateImportProject,
    {
      mutationKey: ["importProject"],
      onSuccess: (data) => {
        queryClient.invalidateQueries("fetchProjects");
        reset();

        if (data?.warnings.length === 0) {
          toggleImportSnackbar();
        } else {
          toggleWarningDialog();
        }

        if (onImportProject) toggleImportProject();
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );

  return (
    <>
      {smallScreen && (
        <>
          <Button
            component="label"
            role={undefined}
            tabIndex={-1}
            startIcon={<FileUploadOutlined />}
            {...buttonProps}
          >
            <VisuallyHiddenInput
              type="file"
              onChange={(e) => {
                // console.log(e.target.files);

                if (e.target.files.length === 0) {
                  return;
                }

                mutate({
                  file: e.target.files[0],
                });
              }}
              onClick={(e) => {
                e.target.value = null;
              }}
              accept=".asreview"
            />
          </Button>
        </>
      )}

      {!smallScreen && (
        <>
          <ResponsiveButton
            title={"Import"}
            icon={<FileUploadOutlined />}
            onClick={toggleImportProject}
            {...buttonProps}
          />
          <Popper
            open={onImportProject}
            onClose={toggleImportProject}
            id={id}
            anchorEl={anchorEl}
            placement="bottom"
          >
            <ImportProjectCard
              mutate={mutate}
              onClose={toggleImportProject}
              isLoading={isLoading}
            />
          </Popper>
        </>
      )}

      <Snackbar
        open={importSnackbar}
        onClose={toggleImportSnackbar}
        autoHideDuration={5000}
        message={`Your project has been imported`}
      />

      <Dialog open={warningDialog} onClose={toggleWarningDialog}>
        {data?.warnings.length > 0 && (
          <>
            <DialogTitle>Imported with warnings</DialogTitle>
            <DialogContent>
              <Typography>
                The project has been imported successfully, but with the
                following warnings:
              </Typography>
              {data?.warnings.map((item, i) => (
                <Alert key={i} severity="warning" sx={{ mt: 2 }}>
                  {item}
                </Alert>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={toggleWarningDialog} color="primary">
                Ok
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default ImportProject;
