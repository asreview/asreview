import * as React from "react";
import { useQuery } from "react-query";
import { Routes, Route, useParams } from "react-router-dom";
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

import { ProjectAPI } from "../api/index.js";
import { drawerWidth } from "../globals.js";

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
  const { project_id } = useParams();

  // History page state
  const [historyLabel, setHistoryLabel] = React.useState("relevant");
  const [historyFilterQuery, setHistoryFilterQuery] = React.useState([]);

  const { data, error, isError, isSuccess } = useQuery(
    ["fetchInfo", { project_id }],
    ProjectAPI.fetchInfo,
    { enabled: project_id !== undefined, refetchOnWindowFocus: false }
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
          <Route
            index
            element={<AnalyticsPage mobileScreen={props.mobileScreen} />}
          />

          {/* Review */}
          {isSuccess && !data?.reviewFinished && (
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
          {isSuccess && data?.reviewFinished && (
            <Route
              path="review"
              element={<ReviewPageFinished mobileScreen={props.mobileScreen} />}
            />
          )}

          {/* History */}
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

          {/* Export */}
          <Route
            path="export"
            element={
              <ExportPage
                enableExportDataset={data?.projectInitReady}
                mobileScreen={props.mobileScreen}
              />
            }
          />

          {/* Details */}
          {isSuccess && (
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
        </Routes>
      </Box>
    </Root>
  );
};

export default ProjectPage;
