import { Box, Stack } from "@mui/material";
import { InteractionButtons } from "Components";
import * as React from "react";
import { DashboardPageHeader, Projects } from ".";

const ProjectsOverview = ({ mobileScreen, mode }) => {
  return (
    <>
      <DashboardPageHeader mode={mode} />
      <Box className="main-page-body-wrapper">
        <Stack className="main-page-body" spacing={6}>
          <Projects mode={mode} mobileScreen={mobileScreen} />

          <InteractionButtons />
        </Stack>
      </Box>
    </>
  );
};

export default ProjectsOverview;
