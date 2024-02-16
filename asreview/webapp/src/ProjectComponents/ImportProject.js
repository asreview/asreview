import * as React from "react";
import { useIsMutating } from "react-query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
} from "@mui/material";
import { Close } from "@mui/icons-material";

import { ImportFromFile } from ".";
import { StyledIconButton } from "../StyledComponents/StyledButton";

const ImportProject = (props) => {
  const isImportingProject = useIsMutating(["importProject"]);
  const isLoading = isImportingProject !== 0;

  return (
    <Dialog
      open={props.open}
      fullScreen={props.mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
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
              onClick={props.toggleImportProject}
            >
              <Close />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <DialogContent dividers>
        <ImportFromFile
          setFeedbackBar={props.setFeedbackBar}
          toggleImportProject={props.toggleImportProject}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImportProject;
