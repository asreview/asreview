import React from "react";
import { connect } from "react-redux";
import { AppBar, ButtonBase, Toolbar, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Menu } from "@material-ui/icons";

import { NavigationDrawer } from "../Components";
import ASReviewLogo from "../images/Wordmark_LAB_colour.svg";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: 4,
  },
  logo: {
    width: 130,
  },
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

const Header = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar color="inherit" position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            edge="start"
            color="inherit"
            onClick={props.toggleNavDrawer}
          >
            <Menu />
          </IconButton>
          <ButtonBase disableRipple>
            <img
              className={classes.logo}
              src={ASReviewLogo}
              alt="ASReview LAB Dashboard"
              onClick={() => {
                props.handleAppState("projects");
                if (!props.mobileScreen && props.app_state !== "projects") {
                  props.toggleNavDrawer();
                }
              }}
            />
          </ButtonBase>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <NavigationDrawer
        mobileScreen={props.mobileScreen}
        onNavDrawer={props.onNavDrawer}
        toggleNavDrawer={props.toggleNavDrawer}
        toggleSettings={props.toggleSettings}
        toggleHelp={props.toggleHelp}
      />
    </div>
  );
};

export default connect(mapStateToProps)(Header);
