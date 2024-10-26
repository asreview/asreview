import {
  Container,
  Divider,
  Grid2 as Grid,
  Stack,
  Typography,
} from "@mui/material";
import { InteractionButtons } from "Components";
import { DashboardPageHeader } from ".";

import { projectModes, projectStatuses } from "globals.js";

import { ProjectCard } from "HomeComponents/DashboardComponents";
import { ProjectAPI } from "api";
import { useQuery } from "react-query";

import { Upload } from "ProjectComponents/SetupComponents";

import ImportProject from "ProjectComponents/ImportProject";
import NewProjectButton from "./NewProjectButton";

const ProjectsOverview = ({ mode }) => {
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

  const { data } = useQuery(
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

  return (
    <>
      <DashboardPageHeader mode={mode} />

      {/* <Stack direction="row" spacing={2}>
        <NewProjectButton mode={mode} />
        <ImportProject />
      </Stack> */}

      <Container maxWidth="md">
        <Upload mode={mode} />
      </Container>
      <Container maxWidth="md">
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
                  <ProjectCard
                    project={project}
                    mode={mode}
                    showProgressChip={false}
                    key={project.project_id}
                  />
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
                  <ProjectCard
                    project={project}
                    mode={mode}
                    showProgressChip={false}
                    key={project.project_id}
                  />
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
