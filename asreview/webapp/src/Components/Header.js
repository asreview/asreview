import React from "react";
import { connect, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, ButtonBase, Toolbar, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Menu } from "@mui/icons-material";

import { ProfilePopper } from "../Components";

import { WordmarkState } from "../globals";

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

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

const Header = (props) => {
  const navigate = useNavigate();
  const authentication = useSelector((state) => state.authentication);

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
            <ButtonBase disableRipple>
              <img
                className={classes.logo}
                src={WordmarkState()}
                alt="ASReview LAB Dashboard"
                onClick={() => {
                  navigate("/projects");
                }}
              />
            </ButtonBase>
          </Box>
          {authentication === true && (
            <ProfilePopper mobilescreen={props.mobilescreen} />
          )}
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />
    </Root>
  );
};

export default connect(mapStateToProps)(Header);
