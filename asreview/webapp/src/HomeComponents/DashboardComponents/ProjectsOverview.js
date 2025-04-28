import {
  Alert,
  Button,
  Container,
  Divider,
  Grid2 as Grid,
  Stack,
  Typography,
} from "@mui/material";

import { ProjectAPI } from "api";
import { InlineErrorHandler, InteractionButtons } from "Components";
import { projectModes, projectStatuses } from "globals.js";
import { ProjectCard } from "HomeComponents/DashboardComponents";
import { Upload } from "ProjectComponents/SetupComponents";
import { DashboardPageHeader } from ".";

import { useMutation, useQuery, useQueryClient } from "react-query";

const ProjectsOverview = ({ mode }) => {
  const queryClient = useQueryClient();

  const simulationOngoing = (data) => {
    if (
      mode === projectModes.SIMULATION &&
      data?.result.some(
        (project) => project.reviews[0]?.status === projectStatuses.REVIEW,
      )
    ) {
      return 5000;
    }
    return false;
  };

  const { data, isError, error, refetch } = useQuery(
    ["fetchProjects", { subset: mode }],
    ProjectAPI.fetchProjects,
    {
      refetchInterval: simulationOngoing,
      refetchIntervalInBackground: true,
    },
  );

  const inReviewProjects = data?.result.filter(
    (project) =>
      project.reviews[0]?.status === projectStatuses.REVIEW ||
      project.reviews[0]?.status === projectStatuses.SETUP,
  );
  const finishedProjects = data?.result.filter(
    (project) => project.reviews[0]?.status === projectStatuses.FINISHED,
  );

  const {
    mutate: upgradeProjects,
    isLoading: isUpgradingProjects,
    error: upgradeError,
  } = useMutation(ProjectAPI.mutateUpgradeProjects, {
    onSuccess: () => {
      queryClient.invalidateQueries("fetchProjects");
    },
    onError: (error) => {
      queryClient.invalidateQueries("fetchProjects");
    },
  });

  return (
    <>
      <DashboardPageHeader mode={mode} />
      <Container maxWidth="md">
        <Upload mode={mode} />
      </Container>
      <Container maxWidth="md">
        {isError && (
          <InlineErrorHandler
            message={error?.message}
            button
            refetch={refetch}
          />
        )}
        {data?.upgrade_count > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {`You have ${data?.upgrade_count} project(s) that need(s) to be upgraded. Please upgrade your projects to the latest version of ASReview.`}
            <Button
              variant="contained"
              onClick={upgradeProjects}
              sx={{ mt: 2 }}
              color="inherit"
              loading={isUpgradingProjects}
            >
              Upgrade projects
            </Button>
          </Alert>
        )}
        {upgradeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            There was an error while upgrading your projects. Please contact the
            ASReview team via asreview@uu.nl.
          </Alert>
        )}
        <Stack spacing={6}>
          <>
            {/* Divider between In Review and Finished with a Chip */}
            {inReviewProjects?.length > 0 && (
              <Divider
                sx={{
                  my: 10,
                }}
              >
                <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
                  {mode === projectModes.ORACLE
                    ? "Current reviews"
                    : "Running simulations"}
                </Typography>
              </Divider>
            )}

            {/* Projects in Review */}
            {inReviewProjects?.length > 0 && (
              <Grid container spacing={2}>
                {inReviewProjects.map((project) => (
                  <ProjectCard project={project} mode={mode} key={project.id} />
                ))}
              </Grid>
            )}

            {/* Divider between In Review and Finished with a Chip */}
            {finishedProjects?.length > 0 && (
              <Divider
                sx={{
                  my: 10,
                }}
              >
                <Typography variant="h5" sx={{ fontFamily: "Roboto Serif" }}>
                  {mode === projectModes.ORACLE
                    ? "Finished reviews"
                    : "Finished simulations"}
                </Typography>
              </Divider>
            )}

            {/* Finished Projects */}
            {finishedProjects?.length > 0 && (
              <Grid container spacing={2}>
                {finishedProjects.map((project) => (
                  <ProjectCard project={project} mode={mode} key={project.id} />
                ))}
              </Grid>
            )}

            {mode === projectModes.ORACLE &&
              inReviewProjects?.length > 0 &&
              finishedProjects?.length === 0 && (
                <Typography sx={{ textAlign: "center", fontStyle: "italic" }}>
                  Done reviewing? Mark your project as finished to keep things
                  organized!
                </Typography>
              )}
          </>

          {data?.result.length > 0 && <InteractionButtons />}
        </Stack>
      </Container>
    </>
  );
};

export default ProjectsOverview;
