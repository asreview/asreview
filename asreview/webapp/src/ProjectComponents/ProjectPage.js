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

import { DialogErrorHandler } from "../Components";
import { AnalyticsPage } from "../ProjectComponents/AnalyticsComponents";
import { DetailsPage } from "../ProjectComponents/DetailsComponents";
import { HistoryPage } from "../ProjectComponents/HistoryComponents";
import { ExportPage } from "../ProjectComponents/ExportComponents";
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
} from "../globals.js";

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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { project_id } = useParams();
  const resolved = useResolvedPath("");
  const match = useMatch({ path: resolved.pathname, end: true });

  const isAnalyticsPageOpen = () => {
    return match !== null;
  };

  // History page state
  const [historyLabel, setHistoryLabel] = React.useState("relevant");
  const [historyFilterQuery, setHistoryFilterQuery] = React.useState([]);

  const { data, error, isError, isSuccess } = useQuery(
    ["fetchInfo", { project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: project_id !== undefined,
      onSuccess: (data) => {
        if (!data["projectInitReady"]) {
          // set project id
          props.setProjectId(project_id);
          // open project setup dialog
          navigate("/projects");
          props.toggleProjectSetup();
        } else if (!data["projectNeedsUpgrade"]) {
          // open project page
          console.log("Opening project " + project_id);
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
    }
  );

  const isSimulating = () => {
    return (
      data?.mode === projectModes.SIMULATION &&
      data?.projectInitReady &&
      !data?.reviewFinished
    );
  };

  const refetchAnalytics = () => {
    if (isAnalyticsPageOpen()) {
      queryClient.invalidateQueries("fetchProgress");
      queryClient.invalidateQueries("fetchProgressDensity");
      queryClient.invalidateQueries("fetchProgressRecall");
    }
  };

  const { error: checkSimulationError, isError: isCheckSimulationError } =
    useQuery(
      ["fetchSimulationFinished", { project_id }],
      ProjectAPI.fetchSimulationFinished,
      {
        enabled: isSimulating(),
        onSuccess: (data) => {
          if (data["status"] === 1) {
            // refresh analytics
            refetchAnalytics();
            // simulation finished
            queryClient.invalidateQueries("fetchInfo");
          } else {
            // not finished yet
            setTimeout(
              () => queryClient.invalidateQueries("fetchSimulationFinished"),
              checkIfSimulationFinishedDuration
            );
          }
        },
        refetchOnWindowFocus: false,
      }
    );

  const returnError = () => {
    if (isError) {
      return ["fetchInfo", error, isError];
    } else if (isCheckSimulationError) {
      return [
        "fetchSimulationFinished",
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
              element={<AnalyticsPage mobileScreen={props.mobileScreen} />}
            />
          )}

          {/* Review */}
          {isSuccess && !data?.projectNeedsUpgrade && !data?.reviewFinished && (
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
          {isSuccess && !data?.projectNeedsUpgrade && data?.reviewFinished && (
            <Route
              path="review"
              element={<ReviewPageFinished mobileScreen={props.mobileScreen} />}
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

          {/* Export */}
          {isSuccess && !data?.projectNeedsUpgrade && (
            <Route
              path="export"
              element={
                <ExportPage
                  enableExportDataset={data?.projectInitReady}
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
