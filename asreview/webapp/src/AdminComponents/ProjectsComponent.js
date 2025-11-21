import React from "react";
import { useQuery, useMutation } from "react-query";

import {
  Box,
  Stack,
  Alert,
  Grid2 as Grid,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Button,
  Toolbar,
} from "@mui/material";
import { FolderOutlined, Search, Clear, Delete } from "@mui/icons-material";

import { AdminAPI } from "api";
import { HelpPopover, LoadingState, ErrorState } from "Components";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import { UserFormDialog } from "AdminComponents";
import DeleteProjectConfirmationDialog from "./DeleteProjectConfirmationDialog";
import SectionHeader from "./SectionHeader";
import { projectStatuses } from "globals.js";

const ProjectsComponent = () => {
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);

  // User modal state
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [userModalOpen, setUserModalOpen] = React.useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");

  // Batch selection state
  const [selectedProjects, setSelectedProjects] = React.useState([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] =
    React.useState(false);

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

  // Mutation for batch deleting projects
  const { mutate: batchDeleteProjects, isLoading: isDeletingBatch } =
    useMutation((projectIds) => AdminAPI.batchDeleteProjects(projectIds), {
      onSuccess: () => {
        refetch(); // Refresh the project list
        setBatchDeleteDialogOpen(false);
        setSelectedProjects([]);
      },
      onError: (error) => {
        console.error("Failed to batch delete projects:", error);
      },
    });

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalOpen(false);
    setSelectedProject(null);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
    // Close project modal when opening user modal
    setDetailsModalOpen(false);
  };

  const handleProjectClickFromUser = (project) => {
    setSelectedProject(project);
    setDetailsModalOpen(true);
    // Close user modal when opening project modal
    setUserModalOpen(false);
  };

  const handleUserModalClose = () => {
    setUserModalOpen(false);
    setSelectedUser(null);
  };

  // Categorize projects by status with filtering
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

    // Filter projects based on search term (only if search has 3+ characters)
    const filterProjects = (projects) => {
      if (debouncedSearchTerm.length < 3) {
        return projects;
      }
      return projects.filter((project) =>
        (project.name || "")
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()),
      );
    };

    const filteredProjects = filterProjects(projectsData.projects);

    const setup = sortByName(
      filteredProjects.filter((p) => p.status === projectStatuses.SETUP),
    );
    const review = sortByName(
      filteredProjects.filter((p) => p.status === projectStatuses.REVIEW),
    );
    const finished = sortByName(
      filteredProjects.filter((p) => p.status === projectStatuses.FINISHED),
    );
    const error = sortByName(
      filteredProjects.filter((p) => p.status === "error"),
    );

    return { setup, review, finished, error };
  }, [projectsData, debouncedSearchTerm]);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Batch selection handlers
  const handleProjectSelect = (projectId, isSelected) => {
    setSelectedProjects((prevSelected) => {
      if (isSelected) {
        return [...prevSelected, projectId];
      } else {
        return prevSelected.filter((id) => id !== projectId);
      }
    });
  };

  const handleSelectAll = () => {
    const allProjects = [
      ...categorizeProjects.review,
      ...categorizeProjects.finished,
      ...categorizeProjects.setup,
      ...categorizeProjects.error,
    ];
    const allProjectIds = allProjects.map((project) => project.id);
    const allSelected =
      allProjectIds.length > 0 &&
      allProjectIds.every((id) => selectedProjects.includes(id));

    if (allSelected) {
      // Deselect all projects
      setSelectedProjects([]);
    } else {
      // Select all projects
      setSelectedProjects(allProjectIds);
    }
  };

  const handleBatchDelete = () => {
    setBatchDeleteDialogOpen(true);
  };

  const handleConfirmBatchDelete = () => {
    if (selectedProjects.length > 0) {
      batchDeleteProjects(selectedProjects);
    }
  };

  const handleCloseBatchDeleteDialog = () => {
    setBatchDeleteDialogOpen(false);
  };

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
              includes projects from all users, regardless of ownership. Use the
              "Select All Projects" checkbox to select all projects for batch
              deletion, or select individual projects using their checkboxes.
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

      {/* Search Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search projects by name (min 3 characters)"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                  aria-label="clear search"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {debouncedSearchTerm.length > 0 && debouncedSearchTerm.length < 3 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter at least 3 characters to filter projects
          </Typography>
        )}
      </Box>

      {/* Batch Selection Toolbar */}
      {selectedProjects.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: "primary.light",
            borderRadius: 1,
            mb: 1,
            minHeight: "auto !important",
            py: 1,
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="primary.contrastText"
            variant="subtitle1"
            component="div"
          >
            {selectedProjects.length} project
            {selectedProjects.length > 1 ? "s" : ""} selected
          </Typography>
          <Button
            onClick={handleBatchDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            disabled={isDeletingBatch}
            size="small"
            sx={{ whiteSpace: "nowrap", px: 3, py: 1 }}
          >
            Delete Selected
          </Button>
        </Toolbar>
      )}

      {/* Global Select All */}
      {categorizeProjects && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  selectedProjects.length > 0 &&
                  [
                    ...categorizeProjects.review,
                    ...categorizeProjects.finished,
                    ...categorizeProjects.setup,
                    ...categorizeProjects.error,
                  ].every((project) => selectedProjects.includes(project.id))
                }
                indeterminate={
                  selectedProjects.length > 0 &&
                  ![
                    ...categorizeProjects.review,
                    ...categorizeProjects.finished,
                    ...categorizeProjects.setup,
                    ...categorizeProjects.error,
                  ].every((project) => selectedProjects.includes(project.id))
                }
                onChange={handleSelectAll}
                size="small"
              />
            }
            label={
              selectedProjects.length > 0 &&
              [
                ...categorizeProjects.review,
                ...categorizeProjects.finished,
                ...categorizeProjects.setup,
                ...categorizeProjects.error,
              ].every((project) => selectedProjects.includes(project.id))
                ? "Deselect All Projects"
                : "Select All Projects"
            }
          />
        </Box>
      )}

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
                    isSelected={selectedProjects.includes(project.id)}
                    onSelect={handleProjectSelect}
                    showCheckbox={true}
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
                    isSelected={selectedProjects.includes(project.id)}
                    onSelect={handleProjectSelect}
                    showCheckbox={true}
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
                    isSelected={selectedProjects.includes(project.id)}
                    onSelect={handleProjectSelect}
                    showCheckbox={true}
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
                    isSelected={selectedProjects.includes(project.id)}
                    onSelect={handleProjectSelect}
                    showCheckbox={true}
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
        onUserClick={handleUserClick}
      />

      {/* User Form Dialog */}
      <UserFormDialog
        open={userModalOpen}
        onClose={handleUserModalClose}
        user={selectedUser}
        mode="edit"
        isSubmitting={false}
        onSubmit={() => {}} // No-op since we're only viewing user details
        onProjectClick={handleProjectClickFromUser}
      />

      {/* Batch Delete Confirmation Dialog */}
      <DeleteProjectConfirmationDialog
        open={batchDeleteDialogOpen}
        onClose={handleCloseBatchDeleteDialog}
        onConfirm={handleConfirmBatchDelete}
        projects={selectedProjects
          .map((id) =>
            [
              ...categorizeProjects.review,
              ...categorizeProjects.finished,
              ...categorizeProjects.setup,
              ...categorizeProjects.error,
            ].find((p) => p.id === id),
          )
          .filter(Boolean)}
        isDeleting={isDeletingBatch}
        isBatch={true}
      />
    </Box>
  );
};

export default ProjectsComponent;
