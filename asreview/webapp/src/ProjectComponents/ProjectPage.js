import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";

import {
  Routes,
  Route,
  useMatch,
  useNavigate,
  useParams,
  useResolvedPath,
} from "react-router-dom";
import clsx from "clsx";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import { DialogErrorHandler } from "Components";
import { PageHeader } from "Components";
import { AnalyticsPage } from "ProjectComponents/AnalyticsComponents";
import { DetailsPage } from "ProjectComponents/DetailsComponents";
import { LabelHistory } from "ProjectComponents/HistoryComponents";
import { ExportPage } from "ProjectComponents/ExportComponents";
import { CollaborationPage, TeamPage } from "ProjectComponents/TeamComponents";

import { ReviewPage } from "ProjectComponents/ReviewComponents";
import RouteNotFound from "RouteNotFound";

import { ProjectAPI } from "api";
import {
  checkIfSimulationFinishedDuration,
  drawerWidth,
  mapDispatchToProps,
  projectModes,
  projectStatuses,
} from "globals.js";
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

const ProjectPage = (props) => {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { project_id } = useParams();
  const resolved = useResolvedPath("");
  const match = useMatch({ path: resolved.pathname, end: true });

  const isAnalyticsPageOpen = () => {
    return match !== null;
  };

  const [isSimulating, setIsSimulating] = React.useState(false);

  // is this user the ownwer of this project
  const [isOwner, setIsOwner] = React.useState(false);

  const [tags, setTags] = React.useState([]);

  const { data, error, isError, isSuccess } = useQuery(
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
          // set project id
          props.setProjectId(project_id);
          // open project setup dialog
          navigate("/projects");
        } else if (!data["projectNeedsUpgrade"]) {
          // open project page
          console.log("Opening project " + project_id);
          // if simulation is running
          if (
            data["mode"] === projectModes.SIMULATION &&
            data["reviews"][0]["status"] === projectStatuses.REVIEW
          ) {
            setIsSimulating(true);
          }
        } else {
          navigate("/projects");
          // open project check dialog
          props.setProjectCheck({
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

  const refetchAnalytics = () => {
    if (isAnalyticsPageOpen()) {
      queryClient.invalidateQueries("fetchProgress");
      queryClient.invalidateQueries("fetchProgressDensity");
      queryClient.invalidateQueries("fetchProgressRecall");
    }
  };

  const { error: checkSimulationError, isError: isCheckSimulationError } =
    useQuery(
      ["fetchProjectStatus", { project_id }],
      ProjectAPI.fetchProjectStatus,
      {
        enabled: isSimulating,
        onSuccess: (data) => {
          if (data["status"] === projectStatuses.FINISHED) {
            // refresh analytics
            refetchAnalytics();
            // simulation finished
            setIsSimulating(false);
            queryClient.invalidateQueries("fetchInfo");
          } else {
            // not finished yet
            setTimeout(
              () => queryClient.invalidateQueries("fetchProjectStatus"),
              checkIfSimulationFinishedDuration,
            );
          }
        },
        refetchOnWindowFocus: false,
      },
    );

  const returnError = () => {
    if (isError) {
      return ["fetchInfo", error, isError];
    } else if (isCheckSimulationError) {
      return [
        "fetchProjectStatus",
        checkSimulationError,
        isCheckSimulationError,
      ];
    } else {
      return ["", null, false];
    }
  };

  return (
    <Root aria-label="project page">
      <Box
        component="main"
        className={clsx("main-page-content", classes.content, {
          [classes.contentShift]: !props.mobileScreen && props.onNavDrawer,
        })}
        aria-label="project page content"
      >
        <Routes>
          {/* Analytics */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              index
              element={
                <AnalyticsPage
                  isSimulating={isSimulating}
                  mobileScreen={props.mobileScreen}
                  mode={data?.mode}
                  refetchAnalytics={refetchAnalytics}
                />
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
                  mobileScreen={props.mobileScreen}
                  projectMode={data?.mode}
                  fontSize={props.fontSize}
                  undoEnabled={props.undoEnabled}
                  tags={tags}
                />
              }
            />
          )}

          {/* History */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="history"
              element={
                <>
                  <PageHeader
                    header="History"
                    mobileScreen={props.mobileScreen}
                  />
                  <LabelHistory project_id={project_id} />
                </>
              }
            />
          )}

          {/* Team */}
          {isSuccess && window.authentication && !data?.projectNeedsUpgrade && (
            <Route
              path="team"
              element={
                isOwner ? (
                  <TeamPage mobileScreen={props.mobileScreen} info={data} />
                ) : (
                  <CollaborationPage info={data} />
                )
              }
            />
          )}

          {/* Export */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="export"
              element={
                <ExportPage
                  info={data}
                  isSimulating={isSimulating}
                  mobileScreen={props.mobileScreen}
                />
              }
            />
          )}

          {/* Details */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="details"
              element={
                <>
                  <PageHeader
                    header="Details"
                    mobileScreen={props.mobileScreen}
                  />
                  <DetailsPage
                    project_id={project_id}
                    info={data}
                    tags={tags}
                    isSimulating={isSimulating}
                    mobileScreen={props.mobileScreen}
                  />
                </>
              }
            />
          )}

          {isSuccess && <Route path="*" element={<RouteNotFound />} />}
        </Routes>
      </Box>
      <DialogErrorHandler
        isError={returnError()[2]}
        error={returnError()[1]}
        queryKey={returnError()[0]}
      />
    </Root>
  );
};

export default connect(null, mapDispatchToProps)(ProjectPage);
