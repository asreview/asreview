import React from "react";
import { useQueryClient } from "react-query";
import { Route, Routes, useParams } from "react-router-dom";
import {
  Divider,
  Fade,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Help, Payment, Settings } from "@mui/icons-material";

import { DrawerItem } from "../Components";

import { ProjectAPI } from "../api/index.js";
import { donateURL, projectModes } from "../globals.js";
import Finished from "../images/ElasHoldingSIGNS_Finished.svg";
import InReview from "../images/ElasHoldingSIGNS_InReview.svg";
import SetUp from "../images/ElasHoldingSIGNS_SetUp.svg";

const PREFIX = "DrawerItemContainer";

const classes = {
  topSection: `${PREFIX}-topSection`,
  bottomSection: `${PREFIX}-bottomSection`,
  icon: `${PREFIX}-icon`,
  projectInfo: `${PREFIX}-projectInfo`,
  yourProject: `${PREFIX}-yourProject`,
  projectTitle: `${PREFIX}-projectTitle`,
  stateElas: `${PREFIX}-stateElas`,
};

const StyledList = styled(List)(({ theme }) => ({
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  [`& .${classes.topSection}`]: {
    overflowX: "hidden",
    overflowY: "auto",
    flex: "1 1 auto",
  },

  [`& .${classes.bottomSection}`]: {
    overflow: "hidden",
    flex: "0 0 auto",
  },

  [`& .${classes.icon}`]: {
    paddingLeft: 8,
  },

  [`& .${classes.projectInfo}`]: {
    display: "block",
    "& > *": {
      marginTop: theme.spacing(2),
    },
  },

  [`& .${classes.yourProject}`]: {
    paddingLeft: 12,
    paddingRight: 12,
  },

  [`& .${classes.projectTitle}`]: {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },

  [`& .${classes.stateElas}`]: {
    width: "100%",
    maxWidth: "140px",
    display: "block",
    margin: "auto",
  },
}));

const DrawerItemContainer = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const [projectInfo, setProjectInfo] = React.useState(null);

  const fetchProjectInfo = React.useCallback(async () => {
    const data = await queryClient.fetchQuery(
      ["fetchInfo", { project_id }],
      ProjectAPI.fetchInfo
    );
    setProjectInfo(data);
  }, [project_id, queryClient]);

  const returnElasState = () => {
    // setup
    if (projectInfo && !projectInfo.projectInitReady) {
      return SetUp;
    }

    // review
    if (!projectInfo?.reviewFinished) {
      return InReview;
    }

    // finished
    if (projectInfo?.reviewFinished) {
      return Finished;
    }
  };

  /**
   * Drawer items on home page
   * Any change here requires change in DrawerItem
   */
  const drawerItemsHomePage = [
    {
      path: "/projects",
      label: "Projects",
    },
  ];
  /**
   * Drawer items on project page
   * Any change here requires change in DrawerItem
   */
  const drawerItemsProjectPage = [
    {
      path: "",
      label: "Analytics",
    },
    {
      path: "review",
      label: "Review",
    },
    {
      path: "history",
      label: "History",
    },
    {
      path: "export",
      label: "Export",
    },
    {
      path: "details",
      label: "Details",
    },
  ];

  React.useEffect(() => {
    if (project_id) {
      fetchProjectInfo();
    }
  }, [fetchProjectInfo, project_id]);

  return (
    <StyledList aria-label="drawer item container">
      {/* Top Section: Home page drawer */}
      <Routes>
        <Route
          path="*"
          element={
            <Fade in>
              <div className={classes.topSection}>
                {drawerItemsHomePage.map((element, index) => {
                  return (
                    <DrawerItem
                      key={index}
                      path={element.path}
                      label={element.label}
                      mobileScreen={props.mobileScreen}
                      onNavDrawer={props.onNavDrawer}
                      toggleNavDrawer={props.toggleNavDrawer}
                    />
                  );
                })}
              </div>
            </Fade>
          }
        />

        {/* Top Section: Project page drawer */}
        <Route
          path="projects/:project_id/*"
          element={
            <Fade in={projectInfo !== null}>
              <div className={classes.topSection}>
                <DrawerItem
                  mobileScreen={props.mobileScreen}
                  label="Projects"
                  path="/projects"
                  onNavDrawer={props.onNavDrawer}
                  toggleNavDrawer={props.toggleNavDrawer}
                />
                <ListItem className={classes.projectInfo}>
                  <img
                    src={returnElasState()}
                    alt="ElasState"
                    className={classes.stateElas}
                  />
                  <Fade in={props.onNavDrawer} unmountOnExit>
                    <div className={classes.yourProject}>
                      <Typography variant="subtitle2">Your project</Typography>
                      <Typography
                        className={classes.projectTitle}
                        variant="body2"
                        color="textSecondary"
                      >
                        {projectInfo ? projectInfo.name : "Null"}
                      </Typography>
                    </div>
                  </Fade>
                </ListItem>
                {drawerItemsProjectPage
                  .filter((element) => {
                    return projectInfo?.mode !== projectModes.SIMULATION
                      ? element
                      : element.path !== "review";
                  })
                  .map((element, index) => {
                    return (
                      <DrawerItem
                        key={index}
                        path={element.path}
                        label={element.label}
                        mobileScreen={props.mobileScreen}
                        onNavDrawer={props.onNavDrawer}
                        toggleNavDrawer={props.toggleNavDrawer}
                      />
                    );
                  })}
              </div>
            </Fade>
          }
        />
      </Routes>

      {/* Bottom Section */}
      <div className={classes.bottomSection}>
        <Divider />
        {donateURL !== undefined && (
          <Tooltip disableHoverListener={props.onNavDrawer} title="Donate">
            <ListItemButton
              component={"a"}
              color="inherit"
              href={donateURL}
              target="_blank"
            >
              <ListItemIcon className={classes.icon}>
                <Payment />
              </ListItemIcon>
              <ListItemText primary="Donate" />
            </ListItemButton>
          </Tooltip>
        )}
        <Tooltip disableHoverListener={props.onNavDrawer} title="Settings">
          <ListItemButton
            onClick={() => {
              if (props.mobileScreen) {
                props.toggleNavDrawer();
              }
              props.toggleSettings();
            }}
          >
            <ListItemIcon className={classes.icon}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </Tooltip>
        <Tooltip disableHoverListener={props.onNavDrawer} title="Help">
          <ListItemButton
            onClick={() => {
              if (props.mobileScreen) {
                props.toggleNavDrawer();
              }
              props.toggleHelpDialog();
            }}
          >
            <ListItemIcon className={classes.icon}>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItemButton>
        </Tooltip>
      </div>
    </StyledList>
  );
};

export default DrawerItemContainer;
