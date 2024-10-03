import { Box, Stack } from "@mui/material";
import { InteractionButtons } from "Components";
import { DashboardPageHeader } from ".";

import { projectModes, projectStatuses } from "globals.js";

import { ProjectCard } from "HomeComponents/DashboardComponents";
import { ProjectAPI } from "api";
import useAuth from "hooks/useAuth";
import { useQuery } from "react-query";

import { Divider, Grid2 as Grid, Typography } from "@mui/material";

const ProjectsOverview = ({ mode }) => {
  const { auth } = useAuth();
  const user_id = auth.id;
  // const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

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
      refetchOnWindowFocus: false,
    },
  );

  const inSetupProjects = data?.result.filter(
    (project) => project.reviews[0]?.status === projectStatuses.SETUP,
  );

  const inReviewProjects = data?.result.filter(
    (project) => project.reviews[0]?.status === projectStatuses.REVIEW,
  );
  const finishedProjects = data?.result.filter(
    (project) => project.reviews[0]?.status === projectStatuses.FINISHED,
  );

  return (
    <>
      <DashboardPageHeader mode={mode} />
      <Box className="main-page-body-wrapper">
        <Stack className="main-page-body" spacing={6}>
          <>
            {/* Projects in Setup */}

            {inSetupProjects?.length > 0 && (
              <>
                <Divider
                  sx={{
                    my: 10,
                  }}
                  // textAlign="left"
                >
                  IN SETUP
                </Divider>
                <Grid container spacing={2}>
                  {inSetupProjects.map((project) => (
                    <Grid
                      key={project.id}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 6,
                      }}
                    >
                      <ProjectCard
                        project={project}
                        mode={mode}
                        user_id={user_id}
                        showProgressChip={false}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Divider between In Review and Finished with a Chip */}
            {inReviewProjects?.length > 0 && (
              <Divider
                sx={{
                  my: 10,
                }}
                // textAlign="left"
              >
                {mode === projectModes.ORACLE ? "IN REVIEW" : "SIMULATING"}
              </Divider>
            )}

            {/* Projects in Review */}
            {inReviewProjects?.length > 0 && (
              <Grid container spacing={2}>
                {inReviewProjects.map((project) => (
                  <Grid
                    key={project.id}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                    }}
                  >
                    <ProjectCard
                      project={project}
                      mode={mode}
                      user_id={user_id}
                      showProgressChip={false}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Divider between In Review and Finished with a Chip */}
            {inReviewProjects?.length > 0 && inReviewProjects?.length > 0 && (
              <Divider
                sx={{
                  my: 10,
                }}
                // textAlign="left"
              >
                FINISHED
              </Divider>
            )}

            {/* Finished Projects */}
            {finishedProjects?.length > 0 && (
              <Grid container spacing={2}>
                {finishedProjects.map((project) => (
                  <Grid
                    key={project.id}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                    }}
                  >
                    <ProjectCard
                      project={project}
                      mode={mode}
                      user_id={user_id}
                      showProgressChip={false}
                    />
                  </Grid>
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
      </Box>
    </>
  );
};

export default ProjectsOverview;
