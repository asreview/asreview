import * as React from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material";

const ListItemButtonDrawer = styled(ListItemButton)(({ theme }) => ({
  "&.MuiListItemButton-root": {
    "&.Mui-selected": {
      color: theme.palette.primary.main,
      "> .MuiListItemIcon-root": {
        color: theme.palette.primary.main,
      },
    },
  },
}));

export const DrawerItem = ({
  icon,
  primary,
  rail = true,
  ...itemButtomProps
}) => {
  return (
    <ListItemButtonDrawer
      {...itemButtomProps}
      sx={(theme) => ({
        p: 1,
        "&.active": {
          // color: theme.palette.secondary.main,
          backgroundColor: alpha(theme.palette.secondary.light, 0.4),
          // "> .MuiListItemIcon-root": {
          //   color: theme.palette.secondary.main,
          // },
        },
      })}
    >
      {!rail && (
        <>
          <ListItemIcon sx={{ pl: 1 }}>{icon}</ListItemIcon>
          <ListItemText primary={primary} />
        </>
      )}
      {rail && (
        <ListItemText
          primary={
            <>
              {icon}
              <Typography variant="body2" fontSize={"0.8rem"}>
                {primary}
              </Typography>
            </>
          }
          sx={{
            textAlign: "center",
          }}
        />
      )}
    </ListItemButtonDrawer>
  );
};
