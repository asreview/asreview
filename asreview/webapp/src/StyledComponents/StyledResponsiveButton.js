import { Button, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const ResponsiveButton = ({ title, icon, ...itemButtomProps }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
