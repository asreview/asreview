import { NavLink } from "react-router-dom";

import { DashboardOutlined } from "@mui/icons-material";
import { Box } from "@mui/system";

import { DrawerItem } from "StyledComponents/StyledDrawerItem";

const LandingDrawerItems = ({ onClick = null, rail = false }) => {
  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        flex: "1 1 auto",
      }}
    >
      <DrawerItem
        key={"projects-reviews"}
        to={"/reviews"}
        primary={"Reviews"}
        rail={rail}
        icon={<DashboardOutlined />}
        component={NavLink}
        onClick={onClick}
      />
      <DrawerItem
        key={"projects-simulations"}
        to={"/simulations"}
        primary={"Simulations"}
        rail={rail}
        icon={<DashboardOutlined />}
        component={NavLink}
        onClick={onClick}
      />
    </Box>
  );
};

export default LandingDrawerItems;
