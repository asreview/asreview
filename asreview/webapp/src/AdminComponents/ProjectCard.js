import React from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardActionArea,
  Chip,
  Alert,
  Grid2 as Grid,
} from "@mui/material";

import { getStatusColor, getStatusLabel } from "utils/projectStatus";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const ProjectCard = React.memo(({ project, onClick }) => {
  const cardContent = (
    <>
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
    </>
  );

  return (
    <Card
      sx={{
        width: "100%",
      }}
      elevation={0}
    >
      {onClick ? (
        <CardActionArea onClick={() => onClick(project)} sx={{ p: 3 }}>
          {cardContent}
        </CardActionArea>
      ) : (
        <Box sx={{ p: 3 }}>{cardContent}</Box>
      )}
    </Card>
  );
});

export default ProjectCard;
