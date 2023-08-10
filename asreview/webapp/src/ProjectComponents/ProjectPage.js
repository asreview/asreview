import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect, useSelector } from "react-redux";

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

import { DialogErrorHandler } from "../Components";
import { AnalyticsPage } from "../ProjectComponents/AnalyticsComponents";
import { DetailsPage } from "../ProjectComponents/DetailsComponents";
import { HistoryPage } from "../ProjectComponents/HistoryComponents";
import { ExportPage } from "../ProjectComponents/ExportComponents";
import { TeamPage } from "./TeamComponents";

import {
  ReviewPage,
  ReviewPageFinished,
} from "../ProjectComponents/ReviewComponents";
import RouteNotFound from "../RouteNotFound";

import { ProjectAPI } from "../api/index.js";
import {
  checkIfSimulationFinishedDuration,
  drawerWidth,
  mapDispatchToProps,
  projectModes,
  projectStatuses,
} from "../globals.js";
import useAuth from "../hooks/useAuth";

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
  const authenticated = useSelector((state) => state.authentication);
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

  // History page state
  const [historyLabel, setHistoryLabel] = React.useState("relevant");
  const [historyFilterQuery, setHistoryFilterQuery] = React.useState([]);

  const { data, error, isError, isSuccess } = useQuery(
    ["fetchInfo", { project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: project_id !== undefined,
      onSuccess: (data) => {
        // set ownership
        setIsOwner(auth?.id === data.ownerId);
        if (
          data.reviews[0] === undefined ||
          data["reviews"][0]["status"] === projectStatuses.SETUP
        ) {
          // set project id
          props.setProjectId(project_id);
          // open project setup dialog
          navigate("/projects");
          props.toggleProjectSetup();
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
          if (data["status"] === "finished") {
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
          {isSuccess &&
            !data?.projectNeedsUpgrade &&
            data?.reviews[0].status === projectStatuses.REVIEW && (
              <Route
                path="review"
                element={
                  <ReviewPage
                    mobileScreen={props.mobileScreen}
                    projectMode={data?.mode}
                    fontSize={props.fontSize}
                    undoEnabled={props.undoEnabled}
                    keyPressEnabled={props.keyPressEnabled}
                  />
                }
              />
            )}

          {/* Review finished */}
          {isSuccess &&
            !data?.projectNeedsUpgrade &&
            data?.reviews[0].status === projectStatuses.FINISHED && (
              <Route
                path="review"
                element={
                  <ReviewPageFinished mobileScreen={props.mobileScreen} />
                }
              />
            )}

          {/* History */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="history"
              element={
                <HistoryPage
                  filterQuery={historyFilterQuery}
                  label={historyLabel}
                  isSimulating={isSimulating}
                  mobileScreen={props.mobileScreen}
                  mode={data?.mode}
                  setFilterQuery={setHistoryFilterQuery}
                  setLabel={setHistoryLabel}
                />
              }
            />
          )}

          {/* Team */}
          {isSuccess && authenticated && !data?.projectNeedsUpgrade && (
            <Route
              path="team"
              element={
                <TeamPage
                  isOwner={isOwner}
                  mobileScreen={props.mobileScreen}
                  mode={data?.mode}
                />
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
                <DetailsPage
                  info={data}
                  isSimulating={isSimulating}
                  mobileScreen={props.mobileScreen}
                  setHistoryFilterQuery={setHistoryFilterQuery}
                />
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
