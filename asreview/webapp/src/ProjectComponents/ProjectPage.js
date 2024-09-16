import * as React from "react";
import { useQuery } from "react-query";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "Components";
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

  // const refetchAnalytics = () => {
  //   if (isAnalyticsPageOpen()) {
  //     queryClient.invalidateQueries("fetchProgress");
  //     queryClient.invalidateQueries("fetchProgressDensity");
  //     queryClient.invalidateQueries("fetchProgressRecall");
  //   }
  // };

  // const { error: checkSimulationError, isError: isCheckSimulationError } =
  //   useQuery(
  //     ["fetchProjectStatus", { project_id }],
  //     ProjectAPI.fetchProjectStatus,
  //     {
  //       enabled: isSimulating,
  //       onSuccess: (data) => {
  //         if (data["status"] === projectStatuses.FINISHED) {
  //           // refresh analytics
  //           refetchAnalytics();
  //           // simulation finished
  //           setIsSimulating(false);
  //           queryClient.invalidateQueries("fetchInfo");
  //         } else {
  //           // not finished yet
  //           setTimeout(
  //             () => queryClient.invalidateQueries("fetchProjectStatus"),
  //             checkIfSimulationFinishedDuration,
  //           );
  //         }
  //       },
  //       refetchOnWindowFocus: false,
  //     },
  //   );

  // const returnError = () => {
  //   if (isError) {
  //     return ["fetchInfo", error, isError];
  //   } else if (isCheckSimulationError) {
  //     return [
  //       "fetchProjectStatus",
  //       checkSimulationError,
  //       isCheckSimulationError,
  //     ];
  //   } else {
  //     return ["", null, false];
  //   }
  // };

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
          {/* Analytics */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              index
              element={
                <>
                  <PageHeader header="Dashboard" mobileScreen={mobileScreen} />
                  <AnalyticsPage
                    isSimulating={isSimulating}
                    mobileScreen={mobileScreen}
                    mode={data?.mode}
                    refetchAnalytics={() => {}}
                  />
                </>
              }
            />
          )}

          {/* Review */}
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

          {/* History */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="collection"
              element={
                <>
                  <PageHeader header="Collection" mobileScreen={mobileScreen} />
                  <LabelHistory project_id={project_id} />
                </>
              }
            />
          )}

          {/* Team */}
          {window.authentication && window.allowTeams && isSuccess && (
            <Route
              path="team"
              element={
                isOwner ? (
                  <TeamPage mobileScreen={mobileScreen} />
                ) : (
                  <CollaborationPage />
                )
              }
            />
          )}
          {/* Details */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="settings"
              element={
                <>
                  <PageHeader header="Settings" mobileScreen={mobileScreen} />
                  <DetailsPage project_id={project_id} info={data} />
                </>
              }
            />
          )}

          {isSuccess && <Route path="*" element={<RouteNotFound />} />}
        </Routes>
      </Box>
      {/* <DialogErrorHandler
        isError={returnError()[2]}
        error={returnError()[1]}
        queryKey={returnError()[0]}
      /> */}
    </Root>
  );
};

export default ProjectPage;
