import React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from "@mui/material";
import { getStatusColor, getStatusLabel } from "utils/projectStatus";

const DeleteProjectConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  project,
  projects,
  isDeleting,
  isBatch = false,
}) => {
  const isBatchMode = isBatch && projects && projects.length > 0;
  const displayProjects = isBatchMode ? projects : project ? [project] : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isBatchMode
          ? `Delete ${projects.length} Project${projects.length > 1 ? "s" : ""}`
          : "Delete Project"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            {isBatchMode
              ? `Are you sure you want to delete ${projects.length} project${projects.length > 1 ? "s" : ""}?`
              : "Are you sure you want to delete the project:"}
          </Typography>
          <Box
            sx={{
              maxHeight: isBatchMode && projects.length > 3 ? 200 : "auto",
              overflowY:
                isBatchMode && projects.length > 3 ? "auto" : "visible",
            }}
          >
            {displayProjects.map((projectItem, index) => (
              <Box
                key={projectItem?.id || index}
                sx={{
                  p: 2,
                  mb: 1,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ flexGrow: 1 }}
                  >
                    {projectItem?.name || "Unnamed Project"}
                  </Typography>
                  {projectItem?.status && (
                    <Chip
                      label={getStatusLabel(projectItem.status)}
                      size="small"
                      color={getStatusColor(projectItem.status)}
                      variant="filled"
                    />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Owner: {projectItem?.owner_name}
                  {projectItem?.owner_email && ` (${projectItem?.owner_email})`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace" }}
                >
                  ID: {projectItem?.project_id}
                </Typography>
                {projectItem?.mode && (
                  <Typography variant="caption" color="text.secondary">
                    Mode: {projectItem.mode}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>This action cannot be undone.</strong> All data associated
              with {isBatchMode ? "these projects" : "this project"} will be
              permanently deleted, including all review data, models, and
              project files.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
        >
          {isDeleting
            ? isBatchMode
              ? "Deleting Projects..."
              : "Deleting..."
            : isBatchMode
              ? `Delete ${projects?.length || 0} Projects`
              : "Delete Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProjectConfirmationDialog;
