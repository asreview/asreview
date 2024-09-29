import * as React from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";

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
      <ListItemButtonDrawer {...itemButtomProps}>
        <ListItemIcon sx={{ pl: 1 }}>{icon}</ListItemIcon>
        <ListItemText primary={primary} />
      </ListItemButtonDrawer>
    </Tooltip>
  );
};
