import React from "react";

import { Link } from "react-router-dom";
import { AppBar, Box, ButtonBase, Toolbar, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Menu } from "@mui/icons-material";

import { ProfilePopper } from "Components";

import { WordMark } from "icons/WordMark";

const PREFIX = "Header";

const classes = {
  appBar: `${PREFIX}-appBar`,
  menuButton: `${PREFIX}-menuButton`,
  logo: `${PREFIX}-logo`,
  toolbar: `${PREFIX}-toolbar`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.appBar}`]: {
    [theme.breakpoints.up("md")]: {
      zIndex: theme.zIndex.drawer + 1,
    },
  },

  [`& .${classes.menuButton}`]: {
    marginRight: 4,
  },

  [`& .${classes.logo}`]: {
    width: 130,
  },

  [`& .${classes.toolbar}`]: {
    justifyContent: "space-between",
  },
}));

const Header = (props) => {
  return (
    <Root aria-label="appbar-toolbar">
      <AppBar color="inherit" position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Box>
            <IconButton
              className={classes.menuButton}
              edge="start"
              color="inherit"
              onClick={props.toggleNavDrawer}
              size="large"
            >
              <Menu />
            </IconButton>
            <ButtonBase
              disableRipple
              sx={{ width: "100px" }}
              component={Link}
              to="/reviews"
            >
              <WordMark />
            </ButtonBase>
          </Box>
          {window.authentication === true && (
            <ProfilePopper mobilescreen={props.mobilescreen} />
          )}
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />
    </Root>
  );
};

export default Header;
