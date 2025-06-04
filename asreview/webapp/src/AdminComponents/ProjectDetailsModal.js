import React from "react";
import { useQuery } from "react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Grid2 as Grid,
} from "@mui/material";
import {
  PersonOutlined,
  AdminPanelSettingsOutlined,
  GroupOutlined,
  CalendarTodayOutlined,
  LabelOutlined,
} from "@mui/icons-material";

import { TeamAPI } from "api";
import { InlineErrorHandler } from "Components";
import { getStatusColor, getStatusLabel } from "utils/projectStatus";
import { getInitials } from "utils/userUtils";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const ProjectDetailsModal = ({ open, onClose, project }) => {
  // Fetch collaborators for this project
  const {
    data: collaborators,
    isLoading: collaboratorsLoading,
    isError: collaboratorsError,
    error: collaboratorsErrorData,
  } = useQuery(["fetchProjectUsers", project?.project_id], TeamAPI.fetchUsers, {
    enabled: Boolean(open && project?.project_id),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (!project) return null;

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
        <Stack spacing={3}>
          {/* Project Basic Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {project.name || "Unnamed Project"}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Project ID:</strong> {project.project_id}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Mode:</strong>{" "}
                  {project.mode && (
                    <Chip
                      label={project.mode}
                      size="small"
                      variant="outlined"
                      color={
                        project.mode === "oracle" ? "primary" : "secondary"
                      }
                    />
                  )}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={getStatusLabel(project.status)}
                    size="small"
                    color={getStatusColor(project.status)}
                    variant="filled"
                  />
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Version:</strong> {project.version || "Unknown"}
                </Typography>
              </Grid>
              {project.created_at_unix && (
                <Grid size={12}>
                  <Typography variant="body2" color="textSecondary">
                    <CalendarTodayOutlined
                      fontSize="small"
                      sx={{ mr: 1, verticalAlign: "middle" }}
                    />
                    <strong>Created:</strong>{" "}
                    {timeAgo.format(project.created_at_unix * 1000)} (
                    {new Date(
                      project.created_at_unix * 1000,
                    ).toLocaleDateString()}
                    )
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider />

          {/* Owner Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              <AdminPanelSettingsOutlined
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              Project Owner
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {getInitials(project.owner_name)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {project.owner_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.owner_email}
                </Typography>
                {(() => {
                  const owner = collaborators?.find((user) => user.owner);
                  return owner?.affiliation ? (
                    <Typography variant="body2" color="textSecondary">
                      {owner.affiliation}
                    </Typography>
                  ) : null;
                })()}
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Members Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              <GroupOutlined
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              Members
            </Typography>

            {collaboratorsLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {collaboratorsError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                <InlineErrorHandler
                  message={
                    collaboratorsErrorData?.message ||
                    "Failed to load collaborators"
                  }
                />
              </Alert>
            )}

            {collaborators && (
              <Box>
                {(() => {
                  const nonOwnerMembers = collaborators.filter(
                    (user) => !user.owner,
                  );
                  return (
                    <>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        {nonOwnerMembers.length} member
                        {nonOwnerMembers.length !== 1 ? "s" : ""}
                      </Typography>

                      {nonOwnerMembers.length > 0 ? (
                        <List sx={{ pt: 0 }}>
                          {nonOwnerMembers.map((user) => (
                            <ListItem key={user.id} sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    bgcolor: user.owner
                                      ? "primary.main"
                                      : "secondary.main",
                                  }}
                                >
                                  {getInitials(user.name)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography variant="body1">
                                      {user.name || user.email}
                                    </Typography>
                                    {user.owner && (
                                      <Chip
                                        label="Owner"
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    )}
                                    {user.pending && (
                                      <Chip
                                        label="Pending"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Stack spacing={0.5}>
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      {user.email}
                                    </Typography>
                                    {user.affiliation && (
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        {user.affiliation}
                                      </Typography>
                                    )}
                                  </Stack>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          No additional members
                        </Typography>
                      )}
                    </>
                  );
                })()}
              </Box>
            )}
          </Box>

          {/* Error Information */}
          {project.error && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom color="error">
                  Error Details
                </Typography>
                <Alert severity="error">
                  <Typography variant="body2">{project.error}</Typography>
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
    </Dialog>
  );
};

export default ProjectDetailsModal;
