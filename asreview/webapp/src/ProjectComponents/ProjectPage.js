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
  container: `${PREFIX}-container`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.content}`]: {
    flexGrow: 1,
    padding: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowY: "scroll",
    height: `calc(100vh - 56px)`,
    // WebkitOverflowScrolling: "touch",
    [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
      height: `calc(100vh - 48px)`,
    },
    [theme.breakpoints.up("sm")]: {
      height: `calc(100vh - 64px)`,
    },
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

  [`& .${classes.container}`]: {
    height: "100%",
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
        className={clsx(classes.content, {
          [classes.contentShift]: !props.mobileScreen && props.onNavDrawer,
        })}
        aria-label="project page content"
      >
        <Box
          className={classes.container}
          aria-label="project page content loaded"
        >
          {/* Analytics */}
          {props.nav_state === "analytics" && <AnalyticsPage />}

          {/* Review page */}
          {isSuccess &&
            props.nav_state === "review" &&
            !data?.reviewFinished && (
              <ReviewPage
                handleAppState={props.handleAppState}
                mobileScreen={props.mobileScreen}
                projectMode={data?.mode}
                fontSize={props.fontSize}
                undoEnabled={props.undoEnabled}
                keyPressEnabled={props.keyPressEnabled}
              />
            )}

          {/* Review page when marked as finished */}
          {isSuccess &&
            props.nav_state === "review" &&
            data?.reviewFinished && (
              <ReviewPageFinished mobileScreen={props.mobileScreen} />
            )}

          {/* History page */}
          {props.nav_state === "history" && (
            <HistoryPage mobileScreen={props.mobileScreen} />
          )}

          {/* Export page */}
          {props.nav_state === "export" && (
            <ExportPage enableExportDataset={data?.projectInitReady} />
          )}

          {/* Details page */}
          {isSuccess && props.nav_state === "details" && (
            <DetailsPage info={data} />
          )}
        </Box>
      </Box>
    </Root>
  );
};

export default connect(mapStateToProps)(ProjectPage);
