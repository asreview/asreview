import { Button, IconButton, Tooltip, useMediaQuery } from "@mui/material";

export const ResponsiveButton = ({ title, icon, ...itemButtomProps }) => {
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  if (fullScreen) {
    return (
      <Tooltip title={title}>
        <IconButton color="primary" disableRipple {...itemButtomProps}>
          {icon}
        </IconButton>
      </Tooltip>
    );
  } else {
    return (
      <Button startIcon={icon} {...itemButtomProps}>
        {title}
      </Button>
    );
  }
};
