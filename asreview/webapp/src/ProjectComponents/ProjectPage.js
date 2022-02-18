import * as React from "react";
import { useQuery } from "react-query";
import { connect } from "react-redux";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
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
import { drawerWidth, mapDispatchToProps } from "../globals.js";

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
  const navigate = useNavigate();
  const { project_id } = useParams();

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
          // props.handleProjectSetup();
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

  return (
    <Root aria-label="project page">
      <DialogErrorHandler
        isError={isError}
        error={error}
        queryKey="fetchInfo"
      />
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
                  setFilterQuery={setHistoryFilterQuery}
                  setLabel={setHistoryLabel}
                  mobileScreen={props.mobileScreen}
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
                  mobileScreen={props.mobileScreen}
                  setHistoryFilterQuery={setHistoryFilterQuery}
                />
              }
            />
          )}

          {isSuccess && <Route path="*" element={<RouteNotFound />} />}
        </Routes>
      </Box>
    </Root>
  );
};

export default connect(null, mapDispatchToProps)(ProjectPage);
