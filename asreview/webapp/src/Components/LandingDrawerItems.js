import { Box, Toolbar } from "@mui/material";

import { AutoModeOutlined } from "@mui/icons-material";

import { DrawerItem } from "StyledComponents/StyledDrawerItem";
import SimulateOutlined from "icons/SimulateOutlined";

import { NavLink } from "react-router-dom";

const LandingDrawerItems = ({ onClick = null, rail = false }) => {
  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        flex: "1 1 auto",
      }}
    >
      <Toolbar sx={{ height: "73.8px" }} />
      <DrawerItem
        key={"projects-reviews"}
        to={"/reviews"}
        primary={"Reviews"}
        rail={rail}
        icon={<SimulateOutlined />}
        component={NavLink}
        onClick={onClick}
      />
      <DrawerItem
        key={"projects-simulations"}
        to={"/simulations"}
        primary={"Simulations"}
        rail={rail}
        icon={<AutoModeOutlined />}
        component={NavLink}
        onClick={onClick}
      />
    </Box>
  );
};

export default LandingDrawerItems;
