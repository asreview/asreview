import { Box, Divider } from "@mui/material";
import { Link, NavLink } from "react-router-dom";

import {
  ArrowBackOutlined,
  AssessmentOutlined,
  AssignmentOutlined,
  LibraryBooksOutlined,
  PeopleAltOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import { DrawerItem } from "StyledComponents/StyledDrawerItem";

const ProjectDrawerItems = ({ subset, onClick = null, rail = false }) => {
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
      <Divider sx={{ mx: 1 }} />
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
            key={"project-reviewer"}
            to={`reviewer`}
            primary={"Reviewer"}
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
