import { Box, Divider } from "@mui/material";
import { Link, NavLink } from "react-router-dom";

import {
  ArrowBackOutlined,
  DashboardOutlined,
  LibraryBooksOutlined,
  PeopleAltOutlined,
  TuneOutlined,
} from "@mui/icons-material";

import ReviewScreenOutlined from "icons/ReviewScreenOutlined";
import { DrawerItem } from "StyledComponents/StyledDrawerItem";

import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";

const ProjectDrawerItems = ({ subset, onClick = null, rail = false }) => {
  const navigate = useNavigate();

  useHotkeys("d", () => navigate(""));
  useHotkeys("r", () => navigate("reviewer"));
  useHotkeys("c", () => navigate("collection"));
  useHotkeys("t", () => window.authentication && navigate("team"));
  useHotkeys("p", () => navigate("customize"));

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
          icon={<DashboardOutlined />}
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
            icon={<ReviewScreenOutlined />}
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

        {window.authentication && (
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
          key={"project-customize"}
          to={`customize`}
          primary={"Customize"}
          rail={rail}
          onClick={onClick}
          icon={<TuneOutlined />}
          component={NavLink}
        />
      </Box>
    </Box>
  );
};

export default ProjectDrawerItems;
