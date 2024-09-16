import * as React from "react";
import { useQuery } from "react-query";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "Components/PageHeader";
import { AnalyticsPage } from "ProjectComponents/AnalyticsComponents";
import { DetailsPage } from "ProjectComponents/DetailsComponents";
import { LabelHistory } from "ProjectComponents/HistoryComponents";
import { CollaborationPage, TeamPage } from "ProjectComponents/TeamComponents";

import { ReviewPage } from "ProjectComponents/ReviewComponents";
import RouteNotFound from "RouteNotFound";

import { ProjectAPI } from "api";
import { drawerWidth, projectModes, projectStatuses } from "globals.js";
import useAuth from "hooks/useAuth";

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

const ProjectPage = ({
  mobileScreen,
  onNavDrawer,
  fontSize,
  projectCheck,
  setProjectCheck,
}) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { project_id } = useParams();

  const [isSimulating, setIsSimulating] = React.useState(false);

  // is this user the ownwer of this project
  const [isOwner, setIsOwner] = React.useState(false);

  const [tags, setTags] = React.useState([]);

  const { data, isSuccess } = useQuery(
    ["fetchInfo", { project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: project_id !== undefined,
      onSuccess: (data) => {
        // set ownership
        setIsOwner(auth?.id === data.ownerId);
        setTags(data["tags"] ?? []);

        if (
          data.reviews[0] === undefined ||
          data["reviews"][0]["status"] === projectStatuses.SETUP
        ) {
          // open project setup dialog
          navigate("/reviews");
        } else if (!data["projectNeedsUpgrade"]) {
          // if simulation is running
          if (
            data["mode"] === projectModes.SIMULATION &&
            data["reviews"][0]["status"] === projectStatuses.REVIEW
          ) {
            setIsSimulating(true);
          }
        } else {
          navigate("/reviews");
          // open project check dialog
          setProjectCheck({
            open: true,
            issue: "upgrade",
            path: "",
            project_id: project_id,
          });
        }
      },
      refetchOnWindowFocus: false,
    },
  );

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
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              index
              element={
                <>
                  <PageHeader>Dashboard</PageHeader>
                  <AnalyticsPage />
                </>
              }
            />
          )}

          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="review"
              element={
                <ReviewPage
                  project_id={project_id}
                  fontSize={fontSize}
                  tags={tags}
                />
              }
            />
          )}

          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="collection"
              element={
                <>
                  <PageHeader>Collection</PageHeader>
                  <LabelHistory project_id={project_id} />
                </>
              }
            />
          )}

          {window.authentication && window.allowTeams && isSuccess && (
            <Route
              path="team"
              element={
                <>
                  <PageHeader>Team</PageHeader>
                  {isOwner ? <TeamPage /> : <CollaborationPage />}
                </>
              }
            />
          )}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="settings"
              element={
                <>
                  <PageHeader>Settings</PageHeader>
                  <DetailsPage project_id={project_id} info={data} />
                </>
              }
            />
          )}

          {isSuccess && <Route path="*" element={<RouteNotFound />} />}
        </Routes>
      </Box>
    </Root>
  );
};

export default ProjectPage;
