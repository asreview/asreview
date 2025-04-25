import { FileUpload } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "react-query";

import { useMediaQuery } from "@mui/material";

import { ProjectAPI } from "api";

import { useToggle } from "hooks/useToggle";
import { useNavigate } from "react-router-dom";

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

const ImportProjectCard = ({ mutate, isLoading, isError, error }) => {
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

  const style = {
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  };

  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

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
          disabled={isLoading}
          disableRipple
          onClick={open}
          sx={{
            height: "100%",
            width: "100%",
            py: 10,
          }}
        >
          <Stack
            spacing={2}
            justifyContent="center"
            sx={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {isLoading ? (
              <CircularProgress />
            ) : (
              <Avatar>
                <FileUpload fontSize="large" />
              </Avatar>
            )}
            <Typography fontSize="1.4rem">
              {mobileScreen
                ? "Upload ASReview file"
                : "Click or drop an ASReview file here"}
            </Typography>
            <Typography fontSize="1rem">Accepted files: .asreview</Typography>
          </Stack>
        </ButtonBase>
        {isError && <Alert severity="error">{error?.message}</Alert>}
      </Paper>
    </Stack>
  );
};

const ImportProject = ({ ...buttonProps }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [importSnackbar, toggleImportSnackbar] = useToggle();
  const [warningDialog, toggleWarningDialog] = useToggle();

  const { mutate, isLoading, data, isError, error } = useMutation(
    ProjectAPI.mutateImportProject,
    {
      mutationKey: ["importProject"],
      onSuccess: (data) => {
        queryClient.invalidateQueries("fetchProjects");

        if (data?.warnings.length === 0) {
          navigateToProject(data?.data?.mode, data?.data?.id);
        } else {
          toggleWarningDialog();
        }
      },
    },
  );

  const navigateToProject = (mode, project_id) => {
    const projectSubset = mode === "oracle" ? "reviews" : "simulations";
    navigate(`/${projectSubset}/${project_id}`);
  };

  return (
    <>
      <ImportProjectCard
        mutate={mutate}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />

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
              <Button
                onClick={() =>
                  navigateToProject(data?.data?.mode, data?.data?.id)
                }
                color="primary"
              >
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
