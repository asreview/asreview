import {
  Box,
  Fade,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
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
import { useToggle } from "hooks/useToggle";
import { DrawerItem } from "StyledComponents/StyledDrawerItem";

import { ElasIcon } from "icons";

const ProjectDrawerItems = ({ subset, onClick = null, rail = false }) => {
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
        rail={rail}
        onClick={onClick}
        icon={<ArrowBackOutlined />}
        component={Link}
      />
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
          rail={rail}
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
            rail={rail}
            onClick={onClick}
            icon={<AssignmentOutlined />}
            component={NavLink}
          />
        )}
        <DrawerItem
          key={"project-history"}
          to={`collection`}
          primary={"Collection"}
          rail={rail}
          onClick={onClick}
          icon={<LibraryBooksOutlined />}
          component={NavLink}
        />

        {window.authentication && window.allowTeams && (
          <DrawerItem
            key={"project-team"}
            to={`team`}
            primary={"Team"}
            rail={rail}
            onClick={onClick}
            icon={<PeopleAltOutlined />}
            component={NavLink}
          />
        )}

        <DrawerItem
          key={"project-settings"}
          to={`settings`}
          primary={"Settings"}
          rail={rail}
          onClick={onClick}
          icon={<SettingsOutlined />}
          component={NavLink}
        />
      </Box>
    </Box>
  );
};

export default ProjectDrawerItems;
