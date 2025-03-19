import React from "react";
import { Box, Button, Dialog, Divider, Stack, Typography } from "@mui/material";
import {
  DoneAll,
  Settings as SettingsIcon,
  Article as ArticleIcon,
  Forum as ForumIcon,
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
    navigate(`/reviews/${project_id}/settings`);
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
              You've reached your stopping threshold for this project.
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

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 1,
                borderLeft: (theme) =>
                  `4px solid ${theme.palette.primary.main}`,
              }}
            >
              You can always return to this menu by clicking the stopping
              suggestion circle.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Available Actions
            </Typography>
            <Stack spacing={2}>
              <Button
                onClick={handleReviewMore}
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  p: 1,
                  textTransform: "none",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  width="100%"
                >
                  <ArticleIcon fontSize="small" color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Review 20 More Records
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Continue screening with an increased threshold
                    </Typography>
                  </Box>
                </Stack>
              </Button>

              <Button
                onClick={handleSelectDifferentModel}
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  p: 1,
                  textTransform: "none",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  width="100%"
                >
                  <SettingsIcon fontSize="small" color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Continue with Different Model
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Switch to an alternative model for further screening
                    </Typography>
                  </Box>
                </Stack>
              </Button>

              <Button
                href="https://github.com/asreview/asreview/discussions/557"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  p: 1,
                  textTransform: "none",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  width="100%"
                >
                  <ForumIcon fontSize="small" color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Learn More About Stopping
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Read about when to stop screening
                    </Typography>
                  </Box>
                </Stack>
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Button onClick={onClose} sx={{ textTransform: "none" }}>
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
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default StoppingReachedDialog;
