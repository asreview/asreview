import * as React from "react";
import { useQuery } from "react-query";
import { connect } from "react-redux";
import clsx from "clsx";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

import { DialogErrorHandler, NavigationDrawer } from "../Components";
import { AnalyticsPage } from "../ProjectComponents/AnalyticsComponents";
import { DetailsPage } from "../ProjectComponents/DetailsComponents";
import { HistoryPage } from "../ProjectComponents/HistoryComponents";
import { ExportPage } from "../ProjectComponents/ExportComponents";
import {
  ReviewPage,
  ReviewPageFinished,
} from "../ProjectComponents/ReviewComponents";

import Finished from "../images/ElasHoldingSIGNS_Finished.svg";
import InReview from "../images/ElasHoldingSIGNS_InReview.svg";
import SetUp from "../images/ElasHoldingSIGNS_SetUp.svg";

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

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
    nav_state: state.nav_state,
    project_id: state.project_id,
  };
};

const ProjectPage = (props) => {
  // History page state
  const [historyLabel, setHistoryLabel] = React.useState("relevant");
  const [historyFilterQuery, setHistoryFilterQuery] = React.useState([]);

  const { data, error, isError, isSuccess } = useQuery(
    ["fetchInfo", { project_id: props.project_id }],
    ProjectAPI.fetchInfo,
    { enabled: props.project_id !== null, refetchOnWindowFocus: false }
  );

  const returnElasState = () => {
    // setup
    if (data && !data.projectInitReady) {
      return SetUp;
    }

    // review
    if (!data?.reviewFinished) {
      return InReview;
    }

    // finished
    if (data?.reviewFinished) {
      return Finished;
    }
  };

  return (
    <Root aria-label="project page">
      <NavigationDrawer
        handleAppState={props.handleAppState}
        handleNavState={props.handleNavState}
        mobileScreen={props.mobileScreen}
        onNavDrawer={props.onNavDrawer}
        toggleNavDrawer={props.toggleNavDrawer}
        toggleSettings={props.toggleSettings}
        returnElasState={returnElasState}
        projectInfo={data}
      />
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
        {/* Analytics */}
        {props.nav_state === "analytics" && (
          <AnalyticsPage mobileScreen={props.mobileScreen} />
        )}

        {/* Review */}
        {isSuccess && props.nav_state === "review" && !data?.reviewFinished && (
          <ReviewPage
            handleAppState={props.handleAppState}
            mobileScreen={props.mobileScreen}
            projectMode={data?.mode}
            fontSize={props.fontSize}
            undoEnabled={props.undoEnabled}
            keyPressEnabled={props.keyPressEnabled}
          />
        )}

        {/* Review finished */}
        {isSuccess && props.nav_state === "review" && data?.reviewFinished && (
          <ReviewPageFinished
            handleNavState={props.handleNavState}
            mobileScreen={props.mobileScreen}
          />
        )}

        {/* History */}
        {props.nav_state === "history" && (
          <HistoryPage
            filterQuery={historyFilterQuery}
            label={historyLabel}
            setFilterQuery={setHistoryFilterQuery}
            setLabel={setHistoryLabel}
            mobileScreen={props.mobileScreen}
          />
        )}

        {/* Export */}
        {props.nav_state === "export" && (
          <ExportPage
            dataWriter={data?.writer}
            enableExportDataset={data?.projectInitReady}
            mobileScreen={props.mobileScreen}
          />
        )}

        {/* Details */}
        {isSuccess && props.nav_state === "details" && (
          <DetailsPage
            handleNavState={props.handleNavState}
            info={data}
            mobileScreen={props.mobileScreen}
            setHistoryFilterQuery={setHistoryFilterQuery}
          />
        )}
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps)(ProjectPage);
