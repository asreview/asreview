import { Drawer } from "@mui/material";
import { styled } from "@mui/material/styles";
// import { drawerWidth } from "globals.js";

// const openedMixin = (theme) => ({
//   width: drawerWidth,
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
//   }),
//   overflowX: "hidden",
// });

// const closedMixin = (theme) => ({
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   overflowX: "hidden",
//   width: `calc(${theme.spacing(7)} + 1px)`,
//   [theme.breakpoints.up("sm")]: {
//     width: `calc(${theme.spacing(9)} + 1px)`,
//   },
// });

export const StyledNavigationRail = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  // flexShrink: 0,
  // whiteSpace: "nowrap",
  // boxSizing: "border-box",
  // variants: [
  //   {
  //     props: ({ open }) => open,
  //     style: {
  //       ...openedMixin(theme),
  //       "& .MuiDrawer-paper": openedMixin(theme),
  //     },
  //   },
  //   {
  //     props: ({ open }) => !open,
  //     style: {
  //       ...closedMixin(theme),
  //       "& .MuiDrawer-paper": closedMixin(theme),
  //     },
  //   },
  // ],
}));
