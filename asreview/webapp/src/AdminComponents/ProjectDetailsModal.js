import React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid2 as Grid,
  Snackbar,
  Stack,
  Divider,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  GroupOutlined,
  CalendarTodayOutlined,
  SwapHorizOutlined,
} from "@mui/icons-material";

import { TeamAPI, AdminAPI } from "api";
import { InlineErrorHandler, UserSelector } from "Components";
import { getStatusColor, getStatusLabel } from "utils/projectStatus";
import { getUserDisplayName } from "utils/userUtils";
import SectionHeader from "./SectionHeader";
import ProjectOwnerSection from "./ProjectOwnerSection";
import TeamSection from "./TeamSection";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const ProjectDetailsModal = ({ open, onClose, project }) => {
  const queryClient = useQueryClient();
  const [selectedNewOwner, setSelectedNewOwner] = React.useState(null);
  const [snackbarState, setSnackbarState] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch updated project data
  const { data: adminProjects, isLoading: projectsLoading } = useQuery(
    ["fetchAdminProjects"],
    AdminAPI.fetchProjects,
    {
      enabled: Boolean(open),
      refetchOnWindowFocus: false,
    },
  );

  // Get the current project data (either fresh from query or fallback to prop)
  const currentProject = React.useMemo(() => {
    if (adminProjects && project) {
      const updatedProject = adminProjects.projects.find(
        (p) => p.id === project.id,
      );
      return updatedProject || project;
    }
    return project;
  }, [adminProjects, project]);

  // Fetch collaborators for this project
  const {
    data: collaborators,
    isLoading: collaboratorsLoading,
    isError: collaboratorsError,
    error: collaboratorsErrorData,
  } = useQuery(
    ["fetchProjectUsers", currentProject?.project_id],
    TeamAPI.fetchUsers,
    {
      enabled: Boolean(open && currentProject?.project_id),
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.warn("Failed to fetch project collaborators:", error?.message);
      },
    },
  );

  // Ownership transfer mutation
  const transferOwnershipMutation = useMutation(
    ({ projectId, newOwnerId }) =>
      AdminAPI.transferProjectOwnership(projectId, newOwnerId),
    {
      onSuccess: (data) => {
        setSnackbarState({
          open: true,
          message: `Project ownership transferred to ${data.project.new_owner.name}`,
          severity: "success",
        });
        setSelectedNewOwner(null);
        // Invalidate all relevant queries to refresh project data
        queryClient.invalidateQueries(["fetchAdminProjects"]);
        queryClient.invalidateQueries([
          "fetchProjectUsers",
          currentProject?.project_id,
        ]);
        queryClient.invalidateQueries(["fetchProjects"]);
        queryClient.invalidateQueries(["fetchAdminUsers"]);
      },
      onError: (error) => {
        setSnackbarState({
          open: true,
          message: error?.message || "Failed to transfer project ownership",
          severity: "error",
        });
      },
    },
  );

  const handleTransferOwnership = () => {
    if (selectedNewOwner && currentProject) {
      transferOwnershipMutation.mutate({
        projectId: currentProject.id,
        newOwnerId: selectedNewOwner.id,
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarState({ open: false, message: "", severity: "success" });
  };

  if (!currentProject) return null;

  const isLoading = projectsLoading || collaboratorsLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontFamily="Roboto Serif">
          Project Details
        </Typography>
      </DialogTitle>

      <DialogContent>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        )}
        <Stack spacing={3}>
          {/* Project Basic Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {currentProject.name || "Unnamed Project"}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Project ID:</strong> {currentProject.project_id}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Mode:</strong>{" "}
                  {currentProject.mode && (
                    <Chip
                      label={currentProject.mode}
                      size="small"
                      variant="outlined"
                      color={
                        currentProject.mode === "oracle"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  )}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={getStatusLabel(currentProject.status)}
                    size="small"
                    color={getStatusColor(currentProject.status)}
                    variant="filled"
                  />
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Version:</strong>{" "}
                  {currentProject.version || "Unknown"}
                </Typography>
              </Grid>
              {currentProject.created_at_unix && (
                <Grid size={12}>
                  <Typography variant="body2" color="textSecondary">
                    <CalendarTodayOutlined
                      fontSize="small"
                      sx={{ mr: 1, verticalAlign: "middle" }}
                    />
                    <strong>Created:</strong>{" "}
                    {timeAgo.format(currentProject.created_at_unix * 1000)} (
                    {new Date(
                      currentProject.created_at_unix * 1000,
                    ).toLocaleDateString()}
                    )
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Owner Information */}
          <Box>
            <SectionHeader
              icon={AdminPanelSettingsOutlined}
              title="Project Owner"
            />
            <ProjectOwnerSection
              project={currentProject}
              collaborators={collaborators}
            />
          </Box>

          {/* Team Section */}
          <Box>
            <SectionHeader icon={GroupOutlined} title="Team" />
            <TeamSection
              collaborators={collaborators}
              isLoading={collaboratorsLoading}
              isError={collaboratorsError}
              errorMessage="Unable to load project team. This may occur after ownership transfer if admin access has changed."
              projectId={currentProject.project_id}
            />
          </Box>

          {/* Transfer Ownership Section */}
          <Box>
            <SectionHeader
              icon={SwapHorizOutlined}
              title="Transfer Ownership"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Transfer this project to another user. If the user is currently a
              member, they will be removed from the members list and become the
              new owner with full access and control.
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={8}>
                <UserSelector
                  projectId={currentProject.project_id}
                  value={selectedNewOwner}
                  onChange={(event, newValue) => setSelectedNewOwner(newValue)}
                  label="New Owner"
                  placeholder="Select a user to transfer ownership to..."
                  excludeOwner={true}
                  excludeMembers={false}
                  disabled={transferOwnershipMutation.isLoading}
                />
              </Grid>
              <Grid size={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleTransferOwnership}
                  disabled={
                    !selectedNewOwner || transferOwnershipMutation.isLoading
                  }
                  sx={{ mb: 1 }}
                  fullWidth
                >
                  {transferOwnershipMutation.isLoading
                    ? "Transferring..."
                    : "Transfer"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Error Information */}
          {currentProject.error && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom color="error">
                  Error Details
                </Typography>
                <Alert severity="error">
                  <Typography variant="body2">
                    {currentProject.error}
                  </Typography>
                </Alert>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          zIndex: 2000,
          mt: 8,
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          sx={{
            width: "100%",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
            fontSize: "1rem",
          }}
          variant="filled"
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ProjectDetailsModal;
