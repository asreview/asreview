import React from "react";
import { useQuery } from "react-query";
import { Route, Routes, useParams, Outlet, Link } from "react-router-dom";
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
  ListItemText,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import {
  Diversity1Outlined,
  HelpOutlineOutlined,
  PaymentOutlined,
  TuneOutlined,
  ArrowBackOutlined,
  AssignmentOutlined,
  AssessmentOutlined,
  SettingsOutlined,
  LibraryBooksOutlined,
  PeopleAltOutlined,
  DashboardOutlined,
} from "@mui/icons-material";

import { OpenInNewIconStyled } from "Components";

import { ElasGame } from "Components";
import { ProjectAPI } from "api";
import { communityURL, donateURL } from "globals.js";
import { useToggle } from "hooks/useToggle";
import { DrawerItem } from "StyledComponents/DrawerItem";

import { ElasSign } from "icons/ElasSign";

const PREFIX = "DrawerItemContainer";

const classes = {
  topSection: `${PREFIX}-topSection`,
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
}));

const ProjectModeMapping = {
  oracle: "Review",
  simulate: "Simulation",
};

const ProjectItemInfo = ({ mobileDrawer, onNavDrawer, toggleNavDrawer }) => {
  const [openGame, toggleGame] = useToggle();
  const { subset, project_id } = useParams();

  const { data } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Box className={classes.topSection}>
      <DrawerItem
        primary={subset[0].toUpperCase() + subset.slice(1)}
        to={"/" + subset}
        showTooltip={onNavDrawer}
        onClick={mobileDrawer ? toggleNavDrawer : undefined}
        icon={<ArrowBackOutlined />}
        component={Link}
      />
      {data && (
        <>
          <ListItem
            onClick={toggleGame}
            sx={{ maxWidth: "140px", margin: "auto" }}
          >
            <ElasSign status={data?.reviews[0].status} />
          </ListItem>
          <Fade in={onNavDrawer} unmountOnExit>
            <ListItem>
              <ListItemText
                primary={`Your ${ProjectModeMapping[data?.mode]}`}
                secondary={data?.name}
              />
            </ListItem>
          </Fade>
        </>
      )}
      <Outlet />

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

const ProjectItemList = ({ mobileDrawer, showToolTip, toggleNavDrawer }) => {
  const { subset, page } = useParams();

  return (
    <Box className={classes.topSection}>
      <DrawerItem
        key={"project-dashboard"}
        to={`../`}
        primary={"Dashboard"}
        selected={page === undefined}
        showTooltip={showToolTip}
        onClick={mobileDrawer ? toggleNavDrawer : undefined}
        icon={<AssessmentOutlined />}
        component={Link}
      />

      {subset === "reviews" && (
        <DrawerItem
          key={"project-review"}
          to={`../review`}
          primary={"Review"}
          selected={page === "review"}
          showTooltip={showToolTip}
          onClick={mobileDrawer ? toggleNavDrawer : undefined}
          icon={<AssignmentOutlined />}
          component={Link}
        />
      )}
      <DrawerItem
        key={"project-history"}
        to={`../collection`}
        primary={"Collection"}
        selected={page === "collection"}
        showTooltip={showToolTip}
        onClick={mobileDrawer ? toggleNavDrawer : undefined}
        icon={<LibraryBooksOutlined />}
        component={Link}
      />

      {window.authentication && window.allowTeams && (
        <DrawerItem
          key={"project-team"}
          to={`../team`}
          primary={"Team"}
          selected={page === "team"}
          showTooltip={showToolTip}
          onClick={mobileDrawer ? toggleNavDrawer : undefined}
          icon={<PeopleAltOutlined />}
          component={Link}
        />
      )}

      <DrawerItem
        key={"project-settings"}
        to={`../settings`}
        primary={"Settings"}
        selected={page === "settings"}
        showTooltip={showToolTip}
        onClick={mobileDrawer ? toggleNavDrawer : undefined}
        icon={<SettingsOutlined />}
        component={Link}
      />
    </Box>
  );
};

const LandingItemList = ({ showTooltip, toggleNavDrawer, mobileDrawer }) => {
  const { subset } = useParams();

  return (
    <div className={classes.topSection}>
      <DrawerItem
        key={"projects-reviews"}
        to={"/reviews"}
        primary={"Reviews"}
        selected={subset === "reviews"}
        showTooltip={showTooltip}
        icon={<DashboardOutlined />}
        component={Link}
        onClick={mobileDrawer ? toggleNavDrawer : undefined}
      />
      <DrawerItem
        key={"projects-simulations"}
        to={"/simulations"}
        primary={"Simulations"}
        selected={subset === "simulations"}
        showTooltip={showTooltip}
        icon={<DashboardOutlined />}
        component={Link}
        onClick={mobileDrawer ? toggleNavDrawer : undefined}
      />
    </div>
  );
};

const DrawerItemContainer = ({
  mobileScreen,
  onNavDrawer,
  toggleNavDrawer,
  toggleHelp,
  toggleSettings,
}) => {
  return (
    <StyledList>
      {/* Top Section: Landing page drawer */}
      <Routes>
        <Route
          path="/:subset"
          element={
            <LandingItemList
              showTooltip={onNavDrawer}
              toggleNavDrawer={toggleNavDrawer}
              mobileDrawer={mobileScreen}
            />
          }
        />
        <Route
          path="/:subset/:project_id"
          element={
            <ProjectItemInfo
              onNavDrawer={onNavDrawer}
              mobileDrawer={mobileScreen}
              toggleNavDrawer={toggleNavDrawer}
            />
          }
        >
          <Route
            path=":page?"
            element={
              <ProjectItemList
                showTooltip={onNavDrawer}
                toggleNavDrawer={toggleNavDrawer}
                mobileDrawer={mobileScreen}
              />
            }
          />
        </Route>
      </Routes>

      <Divider />

      {/* Bottom Section */}
      <Box>
        {donateURL && (
          <DrawerItem
            key={"donate"}
            toolTipTitle={"Donate"}
            primary={
              <React.Fragment>
                Donate <OpenInNewIconStyled />
              </React.Fragment>
            }
            showTooltip={onNavDrawer}
            icon={<PaymentOutlined />}
            component={"a"}
            href={donateURL}
            target="_blank"
            onClick={() => {
              if (mobileScreen) {
                toggleNavDrawer();
              }
            }}
          />
        )}
        {communityURL && (
          <DrawerItem
            key={"community"}
            toolTipTitle={"Community"}
            primary={
              <React.Fragment>
                Community <OpenInNewIconStyled />
              </React.Fragment>
            }
            showTooltip={onNavDrawer}
            icon={<Diversity1Outlined />}
            component={"a"}
            href={communityURL}
            target="_blank"
            onClick={() => {
              if (mobileScreen) {
                toggleNavDrawer();
              }
            }}
          />
        )}

        <DrawerItem
          key={"customize"}
          primary={"Customize"}
          showTooltip={onNavDrawer}
          icon={<TuneOutlined />}
          onClick={() => {
            if (mobileScreen) {
              toggleNavDrawer();
            }
            toggleSettings();
          }}
        />

        <DrawerItem
          key={"help"}
          primary={"Help"}
          showTooltip={onNavDrawer}
          icon={<HelpOutlineOutlined />}
          onClick={() => {
            if (mobileScreen) {
              toggleNavDrawer();
            }
            toggleHelp();
          }}
        />
      </Box>
    </StyledList>
  );
};

export default DrawerItemContainer;
