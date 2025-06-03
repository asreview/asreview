import React from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  Chip,
  Tooltip,
  Alert,
  Grid2 as Grid,
} from "@mui/material";

import { projectStatuses } from "globals.js";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const AdminProjectCard = ({ project }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case projectStatuses.SETUP:
        return "warning";
      case projectStatuses.REVIEW:
        return "primary";
      case projectStatuses.FINISHED:
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case projectStatuses.SETUP:
        return "Setup";
      case projectStatuses.REVIEW:
        return "In Review";
      case projectStatuses.FINISHED:
        return "Finished";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  return (
    <Card
      sx={{
        width: "100%",
        p: 3,
      }}
      elevation={0}
    >
      <Grid container spacing={3} columns={14} alignItems="center">
        <Grid size="grow">
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            <Box sx={{ width: "100%" }}>
              <Typography
                fontSize="1.4rem"
                sx={{
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
              >
                {project?.name || "Unnamed Project"}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 0.5 }}
              >
                Owner: {project?.owner_name}
                {project?.owner_email && ` (${project?.owner_email})`}
              </Typography>
              {project?.created_at_unix && (
                <Typography variant="body2" color="textSecondary">
                  Created: {timeAgo.format(project.created_at_unix * 1000)}
                </Typography>
              )}
              {project?.version && (
                <Typography variant="body2" color="textSecondary">
                  Version: {project.version}
                </Typography>
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid size="auto">
          <Stack direction="row" spacing={1} alignItems="center">
            {project?.mode && (
              <Chip
                label={project.mode}
                size="small"
                variant="outlined"
                color={project.mode === "oracle" ? "primary" : "secondary"}
              />
            )}
            <Chip
              label={getStatusLabel(project?.status)}
              size="small"
              color={getStatusColor(project?.status)}
              variant="filled"
            />
          </Stack>
        </Grid>
      </Grid>

      {project?.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">{project.error}</Typography>
        </Alert>
      )}
    </Card>
  );
};

export default AdminProjectCard;
