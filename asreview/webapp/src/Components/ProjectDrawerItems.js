import {
  Box,
  Fade,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useQuery } from "react-query";
import { Link, NavLink, useParams } from "react-router-dom";

import {
  ArrowBackOutlined,
  AssessmentOutlined,
  AssignmentOutlined,
  LibraryBooksOutlined,
  PeopleAltOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import { ProjectAPI } from "api";
import ElasGameDialog from "./ElasGame";
import { useToggle } from "hooks/useToggle";
import { DrawerItem } from "StyledComponents/StyledDrawerItem";

import { ElasSign } from "icons/ElasSign";
import { ElasIcon } from "icons";

const ProjectModeMapping = {
  oracle: "Review",
  simulate: "Simulation",
};

const ProjectDrawerItems = ({
  subset,
  projectInfo = true,
  onClick = null,
  showTooltip = false,
}) => {
  const [openGame, toggleGame] = useToggle();
  const { project_id } = useParams();

  const { data } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        flex: "1 1 auto",
      }}
    >
      <DrawerItem
        primary={subset[0].toUpperCase() + subset.slice(1)}
        to={"/" + subset}
        showTooltip={showTooltip}
        onClick={onClick}
        icon={<ArrowBackOutlined />}
        component={Link}
      />
      {data && (
        <>
          <Fade in={projectInfo} unmountOnExit>
            <ListItem
              onClick={toggleGame}
              sx={{ maxWidth: "140px", margin: "auto" }}
            >
              <ElasSign status={data?.reviews[0].status} />
            </ListItem>
          </Fade>
          <Fade in={!projectInfo} unmountOnExit>
            <Tooltip
              title={!projectInfo && "Go on adventure with Elas"}
              placement={"right"}
            >
              <ListItem
                key={"project-info"}
                onClick={!projectInfo ? toggleGame : null}
              >
                <ListItemIcon sx={{ pl: 1, py: 1 }}>
                  <ElasIcon />
                </ListItemIcon>
              </ListItem>
            </Tooltip>
          </Fade>
          <Fade in={projectInfo} unmountOnExit>
            <Tooltip
              title={!projectInfo && "Go on adventure with Elas"}
              placement={"right"}
            >
              <ListItem
                key={"project-info"}
                onClick={!projectInfo ? toggleGame : null}
              >
                <ListItemText
                  primary={data?.name}
                  sx={(theme) => ({
                    textAlign: "center",
                    color: theme.palette.primary.main,
                  })}
                />
              </ListItem>
            </Tooltip>
          </Fade>
        </>
      )}

      <Box
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
          flex: "1 1 auto",
        }}
      >
        <DrawerItem
          key={"project-dashboard"}
          to={``}
          primary={"Dashboard"}
          showTooltip={showTooltip}
          onClick={onClick}
          icon={<AssessmentOutlined />}
          component={NavLink}
          end={true}
        />

        {subset === "reviews" && (
          <DrawerItem
            key={"project-review"}
            to={`review`}
            primary={"Review"}
            showTooltip={showTooltip}
            onClick={onClick}
            icon={<AssignmentOutlined />}
            component={NavLink}
          />
        )}
        <DrawerItem
          key={"project-history"}
          to={`collection`}
          primary={"Collection"}
          showTooltip={showTooltip}
          onClick={onClick}
          icon={<LibraryBooksOutlined />}
          component={NavLink}
        />

        {window.authentication && window.allowTeams && (
          <DrawerItem
            key={"project-team"}
            to={`team`}
            primary={"Team"}
            showTooltip={showTooltip}
            onClick={onClick}
            icon={<PeopleAltOutlined />}
            component={NavLink}
          />
        )}

        <DrawerItem
          key={"project-settings"}
          to={`settings`}
          primary={"Settings"}
          showTooltip={showTooltip}
          onClick={onClick}
          icon={<SettingsOutlined />}
          component={NavLink}
        />
      </Box>

      {/* Game */}
      <ElasGameDialog open={openGame} toggleOpen={toggleGame} />
    </Box>
  );
};

export default ProjectDrawerItems;
