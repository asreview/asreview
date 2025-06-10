import React from "react";
import { useQuery } from "react-query";

import {
  Box,
  Stack,
  Alert,
  Grid2 as Grid,
  Chip,
  Typography,
} from "@mui/material";
import { FolderOutlined } from "@mui/icons-material";

import { AdminAPI } from "api";
import { HelpPopover, LoadingState, ErrorState } from "Components";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import SectionHeader from "./SectionHeader";
import { projectStatuses } from "globals.js";

const ProjectsComponent = () => {
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);

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

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedProject(null);
  };

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

    const sortByName = (projects) =>
      projects.sort((a, b) => a.name.localeCompare(b.name));

    const setup = sortByName(
      projectsData.projects.filter((p) => p.status === projectStatuses.SETUP),
    );
    const review = sortByName(
      projectsData.projects.filter((p) => p.status === projectStatuses.REVIEW),
    );
    const finished = sortByName(
      projectsData.projects.filter(
        (p) => p.status === projectStatuses.FINISHED,
      ),
    );
    const error = sortByName(
      projectsData.projects.filter((p) => p.status === "error"),
    );

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
        <HelpPopover>
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
                configuration files. Projects without valid configuration files
                will show as having errors.
              </Typography>
            </Alert>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
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
        </HelpPopover>
      </Box>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading projects..." />}

      {/* Error State */}
      {isError && (
        <ErrorState
          message="Failed to load projects"
          error={error}
          onRetry={refetch}
        />
      )}

      {/* Main Content - only show when not loading and no error */}
      {!isLoading && !isError && (
        <Stack spacing={6}>
          {/* In Review Projects */}
          {categorizeProjects.review.length > 0 && (
            <>
              <SectionHeader
                title={`Current Reviews (${categorizeProjects.review.length})`}
                dividerSx={{ my: 4 }}
                showIcon={false}
              />
              <Grid container spacing={2}>
                {categorizeProjects.review.map((project) => (
                  <ProjectCard
                    project={project}
                    key={project.project_id}
                    onClick={handleProjectClick}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* Finished Projects */}
          {categorizeProjects.finished.length > 0 && (
            <>
              <SectionHeader
                title={`Finished Reviews (${categorizeProjects.finished.length})`}
                dividerSx={{ my: 4 }}
                showIcon={false}
              />
              <Grid container spacing={2}>
                {categorizeProjects.finished.map((project) => (
                  <ProjectCard
                    project={project}
                    key={project.project_id}
                    onClick={handleProjectClick}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* Setup Projects */}
          {categorizeProjects.setup.length > 0 && (
            <>
              <SectionHeader
                title={`Projects in Setup (${categorizeProjects.setup.length})`}
                dividerSx={{ my: 4 }}
                showIcon={false}
              />
              <Grid container spacing={2}>
                {categorizeProjects.setup.map((project) => (
                  <ProjectCard
                    project={project}
                    key={project.project_id}
                    onClick={handleProjectClick}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* Error Projects */}
          {categorizeProjects.error.length > 0 && (
            <>
              <SectionHeader
                title={`Projects with Issues (${categorizeProjects.error.length})`}
                dividerSx={{ my: 4 }}
                showIcon={false}
              />
              <Grid container spacing={2}>
                {categorizeProjects.error.map((project) => (
                  <ProjectCard
                    project={project}
                    key={project.project_id}
                    onClick={handleProjectClick}
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

      {/* Project Details Modal */}
      <ProjectDetailsModal
        open={detailsModalOpen}
        onClose={handleDetailsModalClose}
        project={selectedProject}
      />
    </Box>
  );
};

export default ProjectsComponent;
