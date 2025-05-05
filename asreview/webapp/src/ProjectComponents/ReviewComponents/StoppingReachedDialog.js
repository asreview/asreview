import React from "react";
import {
  Box,
  Button,
  Dialog,
  Divider,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  DoneAll,
  Settings as SettingsIcon,
  Article as ArticleIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { ProjectAPI } from "api";
import { projectStatuses } from "globals.js";

const StoppingReachedDialog = ({ open, onClose, project_id }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate } = useMutation(ProjectAPI.mutateReviewStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchProjectStatus", { project_id }]);
      queryClient.invalidateQueries(["fetchProjectInfo", { project_id }]);
      navigate(`/reviews/${project_id}`);
      onClose();
    },
  });

  const { mutate: updateStoppingRule } = useMutation(
    ProjectAPI.mutateStopping,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "fetchStopping",
          { project_id: project_id },
        ]);
        onClose();
      },
    },
  );

  const handleFinishProject = () => {
    mutate({
      project_id: project_id,
      status: projectStatuses.FINISHED,
    });
  };

  const handleSelectDifferentModel = () => {
    mutate({
      project_id: project_id,
      status: projectStatuses.REVIEW,
    });
    navigate(`/reviews/${project_id}/customize`);
    onClose();
  };

  const handleReviewMore = () => {
    mutate({
      project_id: project_id,
      status: projectStatuses.REVIEW,
    });

    queryClient
      .fetchQuery(["fetchStopping", { project_id }], ProjectAPI.fetchStopping)
      .then((data) => {
        updateStoppingRule({
          project_id: project_id,
          n: data.params.n + 20,
        });
      });
  };

  const handleFinishAndExport = () => {
    mutate(
      {
        project_id: project_id,
        status: projectStatuses.FINISHED,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["fetchProjectStatus", { project_id }]);
          queryClient.invalidateQueries(["fetchProjectInfo", { project_id }]);
          navigate(`/reviews/${project_id}/collection`);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontFamily: "Roboto Serif",
                fontWeight: "bold",
                mb: 3,
                textAlign: "center",
                mt: 3,
              }}
            >
              You've reached your stopping threshold
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "text.secondary",
                mb: 2,
                textAlign: "center",
                fontWeight: 400,
              }}
            >
              How do you want to proceed?
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Available Actions
            </Typography>
            <List sx={{ width: "100%" }}>
              <ListItemButton onClick={handleReviewMore}>
                <ListItemIcon>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Review 20 More Records"
                  secondary="Continue screening with an increased stopping threshold"
                />
              </ListItemButton>

              <ListItemButton onClick={handleSelectDifferentModel}>
                <ListItemIcon>
                  <SettingsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Continue with Different Model"
                  secondary="Switch to a different AI model for further screening"
                />
              </ListItemButton>

              <ListItemButton onClick={handleFinishAndExport}>
                <ListItemIcon>
                  <FileDownloadOutlinedIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Finish Project & Export Results"
                  secondary="Export your results from the collections page"
                />
              </ListItemButton>
            </List>
          </Box>

          <Divider />

          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              href="https://github.com/asreview/asreview/discussions/557"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Learn more
            </Button>
            <Box>
              <Button onClick={onClose} sx={{ textTransform: "none", mr: 1 }}>
                Dismiss
              </Button>
              <Button
                onClick={handleFinishProject}
                variant="contained"
                startIcon={<DoneAll />}
                sx={{ textTransform: "none" }}
              >
                Finish Project
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default StoppingReachedDialog;
