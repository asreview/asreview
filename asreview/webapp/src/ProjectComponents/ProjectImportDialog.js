import * as React from "react";
import { useMutation, useQueryClient } from "react-query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close, Feedback } from "@mui/icons-material";

import { ImportFromFile } from "../ProjectComponents";
import { StyledIconButton } from "../StyledComponents/StyledButton.js";
import { ProjectAPI } from "../api/index.js";

const PREFIX = "ProjectImportDialog";

const classes = {
  title: `${PREFIX}-title`,
  titleButton: `${PREFIX}-title-button`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.title}`]: {
    alignItems: "center",
    justifyContent: "space-between",
  },

  [`& .${classes.titleButton}`]: {
    alignItems: "center",
    paddingRight: 24,
  },
}));

const ProjectImportDialog = (props) => {
  const queryClient = useQueryClient();
  const descriptionElementRef = React.useRef(null);
  const [file, setFile] = React.useState(null);

  // import a project
  const { data, error, isError, isLoading, mutate, reset } = useMutation(
    ProjectAPI.mutateImportProject,
    {
      onSettled: () => {
        setFile(null);
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries("fetchProjects");
        props.onClose();
      },
    }
  );

  React.useEffect(() => {
    if (file) {
      mutate({ file });
    }
  }, [file, mutate]);

  React.useEffect(() => {
    if (props.open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.open]);

  return (
    <StyledDialog
      open={props.open}
      fullScreen={props.mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      TransitionProps={{
        onExited: () =>
          props.setFeedbackBar({
            open: data !== undefined,
            message: `Your project ${data?.name} has been imported`,
          }),
      }}
    >
      <Stack className={classes.title} direction="row" spacing={1}>
        <DialogTitle>Import project</DialogTitle>
        <Stack className={classes.titleButton} direction="row" spacing={1}>
          <Tooltip title="Send feedback">
            <StyledIconButton
              component={"a"}
              href={`https://github.com/asreview/asreview/discussions`}
              target="_blank"
            >
              <Feedback />
            </StyledIconButton>
          </Tooltip>
          <Tooltip title="Close">
            <StyledIconButton onClick={props.onClose}>
              <Close />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <DialogContent dividers>
        <ImportFromFile
          acceptFormat=".asreview"
          addFileError={error}
          file={file}
          setFile={setFile}
          isAddFileError={isError}
          isAddingFile={isLoading}
          reset={reset}
        />
      </DialogContent>
    </StyledDialog>
  );
};

export default ProjectImportDialog;
