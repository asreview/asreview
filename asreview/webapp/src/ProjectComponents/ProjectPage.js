import * as React from "react";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { Route, Routes, useParams } from "react-router-dom";

import { PageHeader } from "Components/PageHeader";
import { AnalyticsPage } from "ProjectComponents/AnalyticsComponents";
import { DetailsPage } from "ProjectComponents/DetailsComponents";
import { LabelHistory } from "ProjectComponents/HistoryComponents";
import { TeamPage } from "ProjectComponents/TeamComponents";

import { ReviewPage } from "ProjectComponents/ReviewComponents";
import RouteNotFound from "RouteNotFound";

import { drawerWidth } from "globals.js";

const PREFIX = "ProjectPage";

const classes = {
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.content}`]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up("md")]: {
      marginLeft: 72,
    },
  },
  [`& .${classes.contentShift}`]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },
}));

const ProjectPage = ({ mobileScreen, onNavDrawer, fontSize }) => {
  const { project_id } = useParams();

  return (
    <Root aria-label="project page">
      <Box
        component="main"
        className={clsx("main-page-content", classes.content, {
          [classes.contentShift]: !mobileScreen && onNavDrawer,
        })}
        aria-label="project page content"
      >
        <Routes>
          <Route
            index
            element={
              <>
                <PageHeader>Dashboard</PageHeader>
                <AnalyticsPage />
              </>
            }
          />

          <Route
            path="review"
            element={<ReviewPage project_id={project_id} fontSize={fontSize} />}
          />

          <Route
            path="collection"
            element={
              <>
                <PageHeader>Collection</PageHeader>
                <LabelHistory project_id={project_id} />
              </>
            }
          />

          {window.authentication && window.allowTeams && (
            <Route
              path="team"
              element={
                <>
                  <PageHeader>Team</PageHeader>
                  <TeamPage />
                </>
              }
            />
          )}
          <Route
            path="settings"
            element={
              <>
                <PageHeader>Settings</PageHeader>
                <DetailsPage project_id={project_id} />
              </>
            }
          />

          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </Box>
    </Root>
  );
};

export default ProjectPage;
