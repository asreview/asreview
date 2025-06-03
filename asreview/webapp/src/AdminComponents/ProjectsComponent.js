import React from "react";
import { useQuery } from "react-query";

import {
  Box,
  Stack,
  Typography,
  IconButton,
  Popover,
  Alert,
  CircularProgress,
  Divider,
  Grid2 as Grid,
  Chip,
} from "@mui/material";
import { FolderOutlined } from "@mui/icons-material";

import { AdminAPI } from "api";
import { InlineErrorHandler } from "Components";
import AdminProjectCard from "./AdminProjectCard";
import { StyledLightBulb } from "StyledComponents/StyledLightBulb";
import { projectStatuses } from "globals.js";

const ProjectsComponent = () => {
  const [anchorElInfo, setAnchorElInfo] = React.useState(null);

  // Fetch projects from the API
  const {
    data: projectsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(["fetchAdminProjects"], AdminAPI.fetchProjects, {
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const handleHelpPopoverOpen = (event) => {
    setAnchorElInfo(event.currentTarget);
  };

  const handleHelpPopoverClose = () => {
    setAnchorElInfo(null);
  };

  const openInfo = Boolean(anchorElInfo);

  // Categorize projects by status
  const categorizeProjects = React.useMemo(() => {
    if (!projectsData?.projects) {
      return {
        setup: [],
        review: [],
        finished: [],
        error: [],
      };
    }

    const setup = projectsData.projects.filter(
      (p) => p.status === projectStatuses.SETUP,
    );
    const review = projectsData.projects.filter(
      (p) => p.status === projectStatuses.REVIEW,
    );
    const finished = projectsData.projects.filter(
      (p) => p.status === projectStatuses.FINISHED,
    );
    const error = projectsData.projects.filter((p) => p.status === "error");

    return { setup, review, finished, error };
  }, [projectsData]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontFamily="Roboto Serif">
          Project Management
        </Typography>
        <IconButton size="small" onClick={handleHelpPopoverOpen}>
          <StyledLightBulb fontSize="small" />
        </IconButton>
        <Popover
          open={openInfo}
          anchorEl={anchorElInfo}
          onClose={handleHelpPopoverClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                maxWidth: 375,
              },
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5} alignItems="flex-start">
              <Typography variant="subtitle1" fontWeight="bold">
                Project Overview
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "justify" }}>
                View and monitor all projects across the ASReview system. This
                includes projects from all users, regardless of ownership.
              </Typography>
              <Alert severity="info">
                <Typography variant="body2">
                  Project names and details are retrieved from project
                  configuration files. Projects without valid configuration
                  files will show as having errors.
                </Typography>
              </Alert>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Project Status
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      label="Setup"
                      color="warning"
                      variant="filled"
                    />
                    <Typography variant="body2">
                      Project is being configured
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      label="In Review"
                      color="primary"
                      variant="filled"
                    />
                    <Typography variant="body2">
                      Active project under review
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      label="Finished"
                      color="success"
                      variant="filled"
                    />
                    <Typography variant="body2">Completed project</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      label="Error"
                      color="error"
                      variant="filled"
                    />
                    <Typography variant="body2">
                      Project has configuration issues
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Popover>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading projects...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Box sx={{ mb: 3 }}>
          <InlineErrorHandler
            message={error?.message || "Failed to load projects"}
            button
            refetch={refetch}
          />
        </Box>
      )}

      {/* Main Content - only show when not loading and no error */}
      {!isLoading && !isError && (
        <Stack spacing={6}>
          {/* In Review Projects */}
          {categorizeProjects.review.length > 0 && (
            <>
              <Divider sx={{ my: 4 }}>
                <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
                  Current Reviews ({categorizeProjects.review.length})
                </Typography>
              </Divider>
              <Grid container spacing={2}>
                {categorizeProjects.review.map((project) => (
                  <AdminProjectCard
                    project={project}
                    key={project.project_id}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* Finished Projects */}
          {categorizeProjects.finished.length > 0 && (
            <>
              <Divider sx={{ my: 4 }}>
                <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
                  Finished Reviews ({categorizeProjects.finished.length})
                </Typography>
              </Divider>
              <Grid container spacing={2}>
                {categorizeProjects.finished.map((project) => (
                  <AdminProjectCard
                    project={project}
                    key={project.project_id}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* Setup Projects */}
          {categorizeProjects.setup.length > 0 && (
            <>
              <Divider sx={{ my: 4 }}>
                <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
                  Projects in Setup ({categorizeProjects.setup.length})
                </Typography>
              </Divider>
              <Grid container spacing={2}>
                {categorizeProjects.setup.map((project) => (
                  <AdminProjectCard
                    project={project}
                    key={project.project_id}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* Error Projects */}
          {categorizeProjects.error.length > 0 && (
            <>
              <Divider sx={{ my: 4 }}>
                <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
                  Projects with Issues ({categorizeProjects.error.length})
                </Typography>
              </Divider>
              <Grid container spacing={2}>
                {categorizeProjects.error.map((project) => (
                  <AdminProjectCard
                    project={project}
                    key={project.project_id}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* No Projects Found */}
          {projectsData?.projects?.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                textAlign: "center",
              }}
            >
              <FolderOutlined
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects will appear here once users create them in the system.
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ProjectsComponent;
