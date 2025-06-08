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
  DeleteOutlined,
  PersonAddOutlined,
} from "@mui/icons-material";

import { TeamAPI, AdminAPI, ProjectAPI } from "api";
import { UserSelector } from "Components";
import { getStatusColor, getStatusLabel } from "utils/projectStatus";
import SectionHeader from "./SectionHeader";
import ProjectOwnerSection from "./ProjectOwnerSection";
import TeamSection from "./TeamSection";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const ProjectDetailsModal = ({ open, onClose, project }) => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = React.useState(false);
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
        setSelectedUser(null);
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

  // Add member mutation
  const addMemberMutation = useMutation(
    ({ projectId, userId }) => {
      console.log("AdminAPI methods:", Object.getOwnPropertyNames(AdminAPI));
      console.log("addProjectMember function:", AdminAPI.addProjectMember);
      return AdminAPI.addProjectMember(projectId, userId);
    },
    {
      onSuccess: (data) => {
        setSnackbarState({
          open: true,
          message: `${data.user.name || data.user.email} added as member successfully`,
          severity: "success",
        });
        setSelectedUser(null);
        // Invalidate queries to refresh data
        queryClient.invalidateQueries(["fetchAdminProjects"]);
        queryClient.invalidateQueries([
          "fetchProjectUsers",
          currentProject?.project_id,
        ]);
        queryClient.invalidateQueries(["fetchAdminUsers"]);
      },
      onError: (error) => {
        setSnackbarState({
          open: true,
          message: error?.message || "Failed to add member",
          severity: "error",
        });
      },
    },
  );

  // Invite user mutation
  const inviteUserMutation = useMutation(
    ({ projectId, userId }) => TeamAPI.inviteUser({ projectId, userId }),
    {
      onSuccess: (data) => {
        setSnackbarState({
          open: true,
          message: `Invitation sent to ${data.user.name || data.user.email} successfully`,
          severity: "success",
        });
        setSelectedUser(null);
        // Invalidate queries to refresh data
        queryClient.invalidateQueries(["fetchAdminProjects"]);
        queryClient.invalidateQueries([
          "fetchProjectUsers",
          currentProject?.project_id,
        ]);
        queryClient.invalidateQueries(["fetchAdminUsers"]);
      },
      onError: (error) => {
        setSnackbarState({
          open: true,
          message: error?.message || "Failed to send invitation",
          severity: "error",
        });
      },
    },
  );

  // Delete project mutation
  const deleteProjectMutation = useMutation(
    ({ projectId }) =>
      ProjectAPI.mutateDeleteProject({ project_id: projectId }),
    {
      onSuccess: () => {
        setSnackbarState({
          open: true,
          message: "Project deleted successfully",
          severity: "success",
        });
        setDeleteConfirmDialog(false);
        // Refresh project list and close modal
        queryClient.invalidateQueries(["fetchAdminProjects"]);
        queryClient.invalidateQueries(["fetchProjects"]);
        // Close modal after a short delay to allow user to see success message
        setTimeout(() => {
          onClose();
        }, 1500);
      },
      onError: (error) => {
        setSnackbarState({
          open: true,
          message: error?.message || "Failed to delete project",
          severity: "error",
        });
        setDeleteConfirmDialog(false);
      },
    },
  );

  // Determine the appropriate action based on user status
  const getUserAction = React.useMemo(() => {
    if (!selectedUser || !collaborators) return null;

    const userInProject = collaborators.find((u) => u.id === selectedUser.id);

    if (!userInProject) {
      // User not involved in project - can be added as member, invited, or transfer ownership
      return {
        type: "multiple_options",
        canAddDirectly: true,
        canInvite: true,
        canTransfer: true,
        label: "Multiple Actions",
      };
    }

    if (userInProject.owner) {
      // User is already owner
      return {
        type: "none",
        label: "Already Project Owner",
      };
    }

    if (userInProject.pending) {
      // User has pending invitation - can only transfer ownership
      return {
        type: "transfer_only",
        label: "Transfer Ownership",
      };
    }

    if (userInProject.member) {
      // User is already member - can only transfer ownership
      return {
        type: "transfer_only",
        label: "Transfer Ownership",
      };
    }

    return {
      type: "multiple_options",
      canAddDirectly: true,
      canInvite: true,
      canTransfer: true,
      label: "Multiple Actions",
    };
  }, [selectedUser, collaborators]);

  const handleUserAction = () => {
    if (!selectedUser || !currentProject || !getUserAction) return;

    const action = getUserAction;

    if (action.type === "transfer_only") {
      // Transfer ownership - uses database ID
      transferOwnershipMutation.mutate({
        projectId: currentProject.id,
        newOwnerId: selectedUser.id,
      });
    } else if (action.type === "multiple_options") {
      // Default to adding member directly (faster) - uses database ID
      addMemberMutation.mutate({
        projectId: currentProject.id,
        userId: selectedUser.id,
      });
    }
  };

  const handleTransferOwnership = () => {
    if (!selectedUser || !currentProject) return;

    transferOwnershipMutation.mutate({
      projectId: currentProject.id,
      newOwnerId: selectedUser.id,
    });
  };

  const handleInviteUser = () => {
    if (!selectedUser || !currentProject) return;

    inviteUserMutation.mutate({
      projectId: currentProject.project_id,
      userId: selectedUser.id,
    });
  };

  const handleDeleteProject = () => {
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (currentProject) {
      deleteProjectMutation.mutate({ projectId: currentProject.project_id });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmDialog(false);
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

          {/* User Management Section */}
          <Box>
            <SectionHeader icon={PersonAddOutlined} title="User Management" />
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Add members, send invitations, or transfer project ownership.
              Available actions depend on the selected user's current status.
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={6}>
                <UserSelector
                  projectId={currentProject.project_id}
                  value={selectedUser}
                  onChange={(event, newValue) => setSelectedUser(newValue)}
                  label="Select User"
                  placeholder="Choose a user to manage..."
                  excludeOwner={false}
                  excludeMembers={false}
                  disabled={
                    transferOwnershipMutation.isLoading ||
                    addMemberMutation.isLoading ||
                    inviteUserMutation.isLoading
                  }
                />
              </Grid>
              <Grid size={6}>
                <Box sx={{ mb: 1 }}>
                  {getUserAction?.type === "multiple_options" && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", gap: 0.5 }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUserAction}
                        disabled={!selectedUser || addMemberMutation.isLoading}
                        size="small"
                        startIcon={<PersonAddOutlined />}
                        sx={{ minWidth: "auto", flex: "1 1 auto" }}
                      >
                        {addMemberMutation.isLoading
                          ? "Adding..."
                          : "Add Member"}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleInviteUser}
                        disabled={!selectedUser || inviteUserMutation.isLoading}
                        size="small"
                        sx={{ minWidth: "auto", flex: "1 1 auto" }}
                      >
                        {inviteUserMutation.isLoading
                          ? "Inviting..."
                          : "Send Invite"}
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={handleTransferOwnership}
                        disabled={
                          !selectedUser || transferOwnershipMutation.isLoading
                        }
                        size="small"
                        startIcon={<SwapHorizOutlined />}
                        sx={{ minWidth: "auto", flex: "1 1 auto" }}
                      >
                        {transferOwnershipMutation.isLoading
                          ? "Transferring..."
                          : "Transfer Ownership"}
                      </Button>
                    </Stack>
                  )}
                  {getUserAction?.type === "transfer_only" && (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleUserAction}
                      disabled={
                        !selectedUser || transferOwnershipMutation.isLoading
                      }
                      fullWidth
                      size="small"
                      startIcon={<SwapHorizOutlined />}
                    >
                      {transferOwnershipMutation.isLoading
                        ? "Transferring..."
                        : "Transfer Ownership"}
                    </Button>
                  )}
                  {getUserAction?.type === "none" && (
                    <Button variant="outlined" disabled fullWidth size="small">
                      Already Project Owner
                    </Button>
                  )}
                  {!getUserAction && selectedUser && (
                    <Button variant="outlined" disabled fullWidth size="small">
                      Select a user
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
            {selectedUser && getUserAction && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, fontStyle: "italic" }}
              >
                {getUserAction.type === "multiple_options" &&
                  "Add Member: Grants immediate access. Send Invite: User must accept invitation. Transfer Ownership: User becomes project owner."}
                {getUserAction.type === "transfer_only" &&
                  "This user will become the new project owner with full control."}
                {getUserAction.type === "none" &&
                  "This user is already the project owner."}
              </Typography>
            )}
          </Box>

          {/* Delete Project Section */}
          <Box>
            <SectionHeader icon={DeleteOutlined} title="Delete Project" />
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2">
                Deleting a project is permanent and cannot be undone. All
                project data, including reviews, labels, and settings will be
                permanently removed.
              </Typography>
            </Alert>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteOutlined />}
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isLoading}
              sx={{ mb: 1 }}
            >
              {deleteProjectMutation.isLoading
                ? "Deleting..."
                : "Delete Project"}
            </Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontFamily="Roboto Serif" color="error">
            Delete Project
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              This action cannot be undone!
            </Typography>
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the project{" "}
            <strong>"{currentProject?.name || "Unnamed Project"}"</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This will permanently remove:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <Typography component="li" variant="body2" color="textSecondary">
              All project data and configuration
            </Typography>
            <Typography component="li" variant="body2" color="textSecondary">
              All review history and labels
            </Typography>
            <Typography component="li" variant="body2" color="textSecondary">
              All team member associations
            </Typography>
            <Typography component="li" variant="body2" color="textSecondary">
              Any exported data will remain unaffected
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            disabled={deleteProjectMutation.isLoading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteProjectMutation.isLoading}
            startIcon={
              deleteProjectMutation.isLoading ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutlined />
              )
            }
          >
            {deleteProjectMutation.isLoading ? "Deleting..." : "Delete Project"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ProjectDetailsModal;
