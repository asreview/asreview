import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, IconButton } from "@material-ui/core";
import { Menu } from "@material-ui/icons";

import MenuDrawer from "./MenuDrawer";

import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: 10,
  },
  appBar: {
    flexGrow: 1,
  },
  appTitle: {
    flexGrow: 1,
  },
  menuTitle: {
    marginLeft: 15,
    marginTop: 15,
  },
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

const Header = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    left: false,
    // right: false
  });

  const toggleDrawer = (side, isOpen) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [side]: isOpen });
  };

  return (
    <div className={classes.appBar}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            edge="start"
            color="inherit"
            onClick={toggleDrawer("left", true)}
          >
            <Menu />
          </IconButton>

          {/*
          <ElasIcon/>
          <Typography
            variant="h5"
            color="inherit"
            className={classes.appTitle}
          >
             ASReview
          </Typography>
        */}

          <Typography variant="h5" color="inherit" className={classes.appTitle}>
            {props.app_state === "project-page" && "Project Dashboard"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <MenuDrawer
        state={state}
        setMenuDrawerState={setState}
        toggleDrawer={toggleDrawer}
        toggleSettings={props.toggleSettings}
        toggleExit={props.toggleExit}
      />
    </div>
  );
};

export default connect(mapStateToProps)(Header);
