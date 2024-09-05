import React from "react";
import { useQuery } from "react-query";
import { Route, Routes, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import {
  Diversity1Outlined,
  HelpOutlineOutlined,
  PaymentOutlined,
  TuneOutlined,
} from "@mui/icons-material";

import { OpenInNewIconStyled } from "Components";

import { DrawerItem, ElasGame } from "Components";
import { ProjectAPI } from "api";
import {
  communityURL,
  donateURL,
  projectModes,
  projectStatuses,
} from "globals.js";
import Finished from "images/ElasHoldingSIGNS_Finished.svg";
import InReview from "images/ElasHoldingSIGNS_InReview.svg";
import SetUp from "images/ElasHoldingSIGNS_SetUp.svg";

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

const returnElasState = (info) => {
  if (
    info?.reviews[0] === undefined ||
    info?.reviews[0].status === projectStatuses.SETUP
  ) {
    return SetUp;
  }
  if (info?.reviews[0].status === projectStatuses.REVIEW) {
    return InReview;
  }
  if (info?.reviews[0].status === projectStatuses.FINISHED) {
    return Finished;
  }
};

const ProjectModeMapping = {
  oracle: "Review",
  explore: "Validation",
  simulate: "Simulation",
};

const ProjectItemList = ({ mobileScreen, onNavDrawer, toggleNavDrawer }) => {
  const [openGame, setOpenGame] = React.useState(false);

  const { project_id, subset } = useParams();

  const toggleGame = () => {
    setOpenGame(!openGame);
  };

  const { data: projectInfo } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  const elasImage = returnElasState(projectInfo);

  return (
    <Box className={classes.topSection}>
      <DrawerItem
        mobileScreen={mobileScreen}
        label={subset[0].toUpperCase() + subset.slice(1)}
        path={"/" + subset}
        onNavDrawer={onNavDrawer}
        toggleNavDrawer={toggleNavDrawer}
      />
      {projectInfo && (
        <ListItem className={classes.projectInfo}>
          <Box
            component="img"
            src={elasImage}
            alt="ElasState"
            className={classes.stateElas}
            onClick={toggleGame}
          />

          <Fade in={onNavDrawer} unmountOnExit>
            <Box className={classes.yourProject}>
              <Typography variant="subtitle2">
                Your {ProjectModeMapping[projectInfo?.mode]} project
              </Typography>
              <Typography
                className={classes.projectTitle}
                variant="body2"
                color="textSecondary"
              >
                {projectInfo?.name}
              </Typography>
            </Box>
          </Fade>
        </ListItem>
      )}

      <DrawerItem
        key={"project-dashboard"}
        path={``}
        label={"Dashboard"}
        mobileScreen={mobileScreen}
        onNavDrawer={onNavDrawer}
        toggleNavDrawer={toggleNavDrawer}
      />

      {projectInfo?.mode !== projectModes.SIMULATION && (
        <DrawerItem
          key={"project-review"}
          path={`review`}
          label={"Review"}
          mobileScreen={mobileScreen}
          onNavDrawer={onNavDrawer}
          toggleNavDrawer={toggleNavDrawer}
        />
      )}
      <DrawerItem
        key={"project-history"}
        path={`collection`}
        label={"Collection"}
        mobileScreen={mobileScreen}
        onNavDrawer={onNavDrawer}
        toggleNavDrawer={toggleNavDrawer}
      />

      {window.authentication && window.allowTeams && (
        <DrawerItem
          key={"project-team"}
          path={`team`}
          label={"Team"}
          mobileScreen={mobileScreen}
          onNavDrawer={onNavDrawer}
          toggleNavDrawer={toggleNavDrawer}
        />
      )}

      <DrawerItem
        key={"project-settings"}
        path={`settings`}
        label={"Settings"}
        mobileScreen={mobileScreen}
        onNavDrawer={onNavDrawer}
        toggleNavDrawer={toggleNavDrawer}
      />

      {/* Game */}
      <Dialog
        open={openGame}
        onClose={toggleGame}
        scroll={"paper"}
        fullWidth={true}
        maxWidth={"lg"}
        aria-labelledby="game-dialog-title"
        aria-describedby="game-dialog-description"
      >
        <DialogTitle id="game-dialog-title">Elas Memory Game</DialogTitle>
        <DialogContent>
          <ElasGame />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleGame}>Take me back</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DrawerItemContainer = (props) => {
  return (
    <StyledList aria-label="drawer item container">
      {/* Top Section: Home page drawer */}
      <Routes>
        <Route
          path="/:subset"
          element={
            <div className={classes.topSection}>
              <DrawerItem
                key={"projects-reviews"}
                path={"/reviews"}
                label={"Reviews"}
                mobileScreen={props.mobileScreen}
                onNavDrawer={props.onNavDrawer}
                toggleNavDrawer={props.toggleNavDrawer}
              />
              <DrawerItem
                key={"projects-validations"}
                path={"/validations"}
                label={"Validations"}
                mobileScreen={props.mobileScreen}
                onNavDrawer={props.onNavDrawer}
                toggleNavDrawer={props.toggleNavDrawer}
              />
              <DrawerItem
                key={"projects-simulations"}
                path={"/simulations"}
                label={"Simulations"}
                mobileScreen={props.mobileScreen}
                onNavDrawer={props.onNavDrawer}
                toggleNavDrawer={props.toggleNavDrawer}
              />
            </div>
          }
        />

        {/* Top Section: Project page drawer */}
        <Route
          path="/:subset/:project_id/*"
          element={
            <ProjectItemList
              mobileScreen={props.mobileScreen}
              onNavDrawer={props.onNavDrawer}
              toggleNavDrawer={props.toggleNavDrawer}
            />
          }
        />
      </Routes>

      {/* Bottom Section */}
      <div className={classes.bottomSection}>
        <Divider />
        {donateURL !== undefined && (
          <Tooltip
            disableHoverListener={props.onNavDrawer}
            title="Donate"
            placement="right"
          >
            <ListItemButton
              component={"a"}
              color="inherit"
              href={donateURL}
              target="_blank"
            >
              <ListItemIcon className={classes.icon}>
                <PaymentOutlined />
              </ListItemIcon>
              <ListItemText
                primary={
                  <React.Fragment>
                    Donate <OpenInNewIconStyled />
                  </React.Fragment>
                }
              />
            </ListItemButton>
          </Tooltip>
        )}
        {communityURL !== undefined && (
          <Tooltip
            disableHoverListener={props.onNavDrawer}
            title="Community"
            placement="right"
          >
            <ListItemButton
              component={"a"}
              color="inherit"
              href={communityURL}
              target="_blank"
            >
              <ListItemIcon className={classes.icon}>
                <Diversity1Outlined />
              </ListItemIcon>
              <ListItemText
                primary={
                  <React.Fragment>
                    Community <OpenInNewIconStyled />
                  </React.Fragment>
                }
              />
            </ListItemButton>
          </Tooltip>
        )}
        <Tooltip
          disableHoverListener={props.onNavDrawer}
          title="Customize"
          placement="right"
        >
          <ListItemButton
            onClick={() => {
              if (props.mobileScreen) {
                props.toggleNavDrawer();
              }
              props.toggleSettings();
            }}
          >
            <ListItemIcon className={classes.icon}>
              <TuneOutlined />
            </ListItemIcon>
            <ListItemText primary="Customize" />
          </ListItemButton>
        </Tooltip>
        <Tooltip
          disableHoverListener={props.onNavDrawer}
          title="Help"
          placement="right"
        >
          <ListItemButton
            onClick={() => {
              if (props.mobileScreen) {
                props.toggleNavDrawer();
              }
              props.toggleHelp();
            }}
          >
            <ListItemIcon className={classes.icon}>
              <HelpOutlineOutlined />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItemButton>
        </Tooltip>
      </div>
    </StyledList>
  );
};

export default DrawerItemContainer;
