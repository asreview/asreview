import * as React from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
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
  toolTipTitle = null,
  showTooltip = true,
  ...itemButtomProps
}) => {
  return (
    <Tooltip
      disableHoverListener={showTooltip}
      title={toolTipTitle || primary}
      placement="right"
    >
      <ListItemButtonDrawer
        {...itemButtomProps}
        sx={(theme) => ({
          "&.active": {
            color: theme.palette.primary.main,
            backgroundColor: alpha(
              theme.palette.primary.light,
              theme.palette.action.selectedOpacity,
            ),
            "> .MuiListItemIcon-root": {
              color: theme.palette.primary.main,
            },
          },
        })}
      >
        <ListItemIcon sx={{ pl: 1 }}>{icon}</ListItemIcon>
        <ListItemText primary={primary} />
      </ListItemButtonDrawer>
    </Tooltip>
  );
};
