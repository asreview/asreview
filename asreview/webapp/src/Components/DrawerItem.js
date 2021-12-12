import * as React from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowBack,
  Assignment,
  Assessment,
  Dashboard,
  Download,
  Edit,
  History,
} from "@mui/icons-material";

const PREFIX = "DrawerItem";

const classes = {
  root: `${PREFIX}-root`,
  icon: `${PREFIX}-icon`,
  textSelected: `${PREFIX}-textSelected`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    [`:before`]: {
      top: 0,
      left: 0,
      width: 4,
      height: "100%",
      content: "' '",
      position: "absolute",
      backgroundColor: theme.palette.primary.main,
    },
  },

  [`& .${classes.icon}`]: {
    paddingLeft: 8,
  },

  [`& .${classes.textSelected}`]: {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const DrawerItem = (props) => {
  const returnSelectedState = () => {
    return props.state === props.value;
  };

  const returnIconColor = () => {
    return returnSelectedState() ? "primary" : "inherit";
  };

  const returnIconState = () => {
    // home page navigation
    if (props.state === "dashboard" && props.label === "Dashboard") {
      return <Dashboard color={returnIconColor()} />;
    }

    // project page navigation
    if (props.state === "project-page" && props.label === "Dashboard") {
      return <ArrowBack />;
    }
    if (props.label === "Analytics") {
      return <Assessment color={returnIconColor()} />;
    }
    if (props.label === "Review") {
      return <Assignment color={returnIconColor()} />;
    }
    if (props.label === "History") {
      return <History color={returnIconColor()} />;
    }
    if (props.label === "Export") {
      return <Download color={returnIconColor()} />;
    }
    if (props.label === "Details") {
      return <Edit color={returnIconColor()} />;
    }
  };

  return (
    <Root>
      <Tooltip disableHoverListener={props.onNavDrawer} title={props.label}>
        <ListItemButton
          selected={returnSelectedState()}
          onClick={() => {
            if (props.mobileScreen) {
              props.toggleNavDrawer();
            }
            if (props.label === "Dashboard") {
              props.setState("home");
            } else {
              props.setState(props.value);
            }
          }}
          className={returnSelectedState() ? classes.root : null}
        >
          <ListItemIcon className={classes.icon}>
            {returnIconState()}
          </ListItemIcon>
          <ListItemText
            primary={props.label}
            primaryTypographyProps={{
              className: returnSelectedState() ? classes.textSelected : null,
            }}
          />
        </ListItemButton>
      </Tooltip>
    </Root>
  );
};

export default DrawerItem;
