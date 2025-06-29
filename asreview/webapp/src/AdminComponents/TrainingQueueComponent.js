import * as React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid2,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  ClearAll as ClearAllIcon,
  Schedule as ScheduleIcon,
  PlayArrow as RunningIcon,
  Storage as DatabaseIcon,
  Computer as ServerIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { AdminAPI } from "api";

const ResetQueueConfirmDialog = ({ open, onClose, onConfirm, isLoading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Reset Training Queue</DialogTitle>
    <DialogContent>
      <Stack spacing={2}>
        <Typography variant="body1">
          Are you sure you want to reset the training queue?
        </Typography>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>This action will:</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
            <li>Clear all waiting training tasks from the queue</li>
            <li>Stop all currently running training processes</li>
            <li>Cannot be undone</li>
          </Typography>
        </Alert>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        disabled={isLoading}
        startIcon={<ClearAllIcon />}
      >
        {isLoading ? "Resetting..." : "Remove tasks"}
      </Button>
    </DialogActions>
  </Dialog>
);

const ResetQueueButton = ({ resetQueueMutation }) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleConfirm = () => {
    resetQueueMutation.mutate();
    setConfirmOpen(false);
  };

  return (
    <>
      <Tooltip title="Reset Training Queue (Clear all waiting tasks and stop running processes)">
        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearAllIcon />}
          onClick={() => setConfirmOpen(true)}
          disabled={resetQueueMutation.isLoading}
        >
          Reset Queue
        </Button>
      </Tooltip>

      <ResetQueueConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        isLoading={resetQueueMutation.isLoading}
      />
    </>
  );
};

const TrainingQueueHeader = ({ refetch, isLoading, resetQueueMutation }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
    <Typography variant="h5" component="h2">
      Training Queue Management
    </Typography>
    <Stack direction="row" spacing={1}>
      <Tooltip title="Refresh Status">
        <IconButton onClick={() => refetch()} disabled={isLoading}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <ResetQueueButton resetQueueMutation={resetQueueMutation} />
    </Stack>
  </Box>
);

const formatDuration = (seconds) => {
  if (!seconds) return "N/A";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const ProjectTable = ({ title, description, projects, type }) => (
  <Paper sx={{ mt: 3 }}>
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
    </Box>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Project ID</TableCell>
            <TableCell>Type</TableCell>
            {type === "waiting" && <TableCell>Waiting Time</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {type === "running" ? project : project.project_id}
                </Typography>
              </TableCell>
              <TableCell>
                {type === "running" ? (
                  <Chip
                    label="Training"
                    color="primary"
                    size="small"
                    icon={<RunningIcon />}
                  />
                ) : (
                  <Chip
                    label={project.simulation ? "Simulation" : "Training"}
                    color={project.simulation ? "secondary" : "primary"}
                    size="small"
                    icon={
                      project.simulation ? <ScheduleIcon /> : <RunningIcon />
                    }
                  />
                )}
              </TableCell>
              {type === "waiting" && (
                <TableCell>
                  {project.waiting_seconds !== null
                    ? formatDuration(Math.floor(project.waiting_seconds))
                    : "Unknown"}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const TrainingQueueComponent = () => {
  const queryClient = useQueryClient();

  // Query for training queue status
  const {
    data: queueStatus,
    isLoading,
    error,
    refetch,
  } = useQuery("trainingQueueStatus", () => AdminAPI.getTaskQueueStatus(), {
    refetchInterval: 60000, // Auto-refresh every minute
    refetchOnWindowFocus: true,
  });

  // Mutation for resetting the training queue
  const resetQueueMutation = useMutation(() => AdminAPI.resetTaskQueue(), {
    onSuccess: (data) => {
      queryClient.invalidateQueries("trainingQueueStatus");

      // Hide the success Alert after 5 seconds
      setTimeout(() => {
        resetQueueMutation.reset();
      }, 5000);
    },
    onError: (error) => {
      console.log("Reset queue error:", error);
    },
  });

  const getTaskManagerStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "success";
      case "offline":
        return "error";
      case "timeout":
        return "warning";
      default:
        return "error";
    }
  };

  const getTaskManagerStatusText = (status) => {
    switch (status) {
      case "connected":
        return "Online";
      case "offline":
        return "Offline";
      case "timeout":
        return "Timeout";
      case "no_response":
        return "No Response";
      default:
        return "Error";
    }
  };

  const isTaskManagerProblematic = () => {
    // Show troubleshooting if there's a general API error (like missing columns)
    if (error) return true;

    if (!queueStatus) return false;

    // Check if Task Manager is offline, timed out, or has error
    if (
      ["offline", "timeout", "error", "no_response"].includes(
        queueStatus.task_manager_status,
      )
    ) {
      return true;
    }

    // Check if tasks have been waiting too long (more than 10 minutes)
    if (
      queueStatus.oldest_waiting_seconds &&
      queueStatus.oldest_waiting_seconds > 600
    ) {
      return true;
    }

    return false;
  };

  const TroubleshootingSection = () => (
    <Alert severity="warning" sx={{ mt: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6">Task Manager Issues Detected</Typography>
      </Stack>

      <Typography variant="body2" sx={{ mb: 2 }}>
        <em>
          When the Task Manager encounters issues, try resetting the training
          queue first using the "Reset Queue" button above. If that doesn't
          resolve the problem, restart the Task Manager process (see
          Troubleshooting Guide below).
        </em>
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HelpIcon />
            <Typography>Troubleshooting Guide</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom>
            Restart Task Manager
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The Task Manager runs as a separate process. Choose the method that
            matches your deployment:
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Development / Manual Installation
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                # Stop the current task manager (Ctrl+C if running in terminal)
                <br />
                # Then restart it:
                <br />$ asreview task-manager
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Docker Deployment
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                # Restart the container that starts asreview lab:
                <br />
                $ docker restart asreview
                <br />
                <br />
                # Or if using docker-compose:
                <br />
                $ docker compose restart asreview
                <br />
                <br />
                # and with rebuilding the asreview image:
                <br />$ docker compose up -d --build asreview
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Before Restarting Task Manager
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Try 'Reset Queue' first (less disruptive)"
                secondary="Use the Reset Queue button above - this often resolves stuck tasks without a full restart"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Check system resources (CPU, memory, disk space)"
                secondary="High resource usage might indicate underlying issues"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Review Task Manager logs for error messages"
                secondary="Look for connection errors, database issues, or memory problems"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            After Restarting
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Wait 10-15 seconds, then refresh this page"
                secondary="Allow time for the Task Manager to fully initialize"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Check that the status shows 'Online'"
                secondary="If still offline, check logs for startup errors"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Verify that queued tasks resume processing"
                secondary="New training requests should be processed normally"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
    </Alert>
  );

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <TrainingQueueHeader
          refetch={refetch}
          isLoading={isLoading}
          resetQueueMutation={resetQueueMutation}
        />

        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load training queue status: {error.message}
        </Alert>

        {/* Show troubleshooting section when there's an error */}
        <TroubleshootingSection />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TrainingQueueHeader
        refetch={refetch}
        isLoading={isLoading}
        resetQueueMutation={resetQueueMutation}
      />

      {/* Status Cards */}
      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        {/* Database Status */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <DatabaseIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Training Queue Database</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isLoading
                      ? "Loading..."
                      : `${queueStatus?.total_waiting || 0} waiting training tasks`}
                  </Typography>
                  {queueStatus?.oldest_waiting_seconds && (
                    <Typography variant="body2" color="warning.main">
                      Oldest:{" "}
                      {formatDuration(queueStatus.oldest_waiting_seconds)}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Task Manager Status */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ServerIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Task Manager</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={getTaskManagerStatusText(
                        queueStatus?.task_manager_status,
                      )}
                      color={getTaskManagerStatusColor(
                        queueStatus?.task_manager_status,
                      )}
                      size="small"
                    />
                    {queueStatus?.task_manager_info && (
                      <Typography variant="body2" color="text.secondary">
                        {queueStatus.task_manager_info.currently_running}/
                        {queueStatus.task_manager_info.max_workers} running
                      </Typography>
                    )}
                  </Stack>
                  {queueStatus?.task_manager_error && (
                    <Typography variant="body2" color="error.main">
                      {queueStatus.task_manager_error}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Currently Training Projects - Show First */}
      {queueStatus?.running_projects &&
        queueStatus.running_projects.length > 0 && (
          <ProjectTable
            title={`Currently Training (${queueStatus.running_projects.length})`}
            description="Projects that are actively running in Task Manager subprocesses"
            projects={queueStatus.running_projects}
            type="running"
          />
        )}

      {/* Waiting Projects Table */}
      {queueStatus?.waiting_projects &&
        queueStatus.waiting_projects.length > 0 && (
          <ProjectTable
            title={`Waiting Projects (${queueStatus.waiting_projects.length})`}
            projects={queueStatus.waiting_projects}
            type="waiting"
          />
        )}

      {/* Empty State */}
      {queueStatus && queueStatus.total_waiting === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No tasks in queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All training tasks are complete or no tasks have been submitted.
          </Typography>
        </Paper>
      )}

      {/* Reset Queue Success Message */}
      {resetQueueMutation.isSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Training queue has been reset successfully.{" "}
          {resetQueueMutation.data?.cleared_waiting_tasks || 0} waiting tasks
          were cleared.
        </Alert>
      )}

      {/* Reset Queue Error Message */}
      {resetQueueMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to reset training queue: {resetQueueMutation.error?.message}
        </Alert>
      )}

      {/* Troubleshooting Section - only show when Task Manager has issues */}
      {isTaskManagerProblematic() && <TroubleshootingSection />}
    </Box>
  );
};

export default TrainingQueueComponent;
