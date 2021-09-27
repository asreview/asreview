import React from "react";
import { connect } from "react-redux";
import { AppBar, ButtonBase, Box, Toolbar, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { Menu } from "@mui/icons-material";

import ASReviewLAB_black from "../images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "../images/asreview_sub_logo_lab_white_transparent.svg";

const useStyles = makeStyles((theme) => ({
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
  const theme = useTheme();

  const wordmarkState = () => {
    if (theme.palette.mode === "dark") {
      return ASReviewLAB_white;
    } else {
      return ASReviewLAB_black;
    }
  };

  return (
    <Box aria-label="appbar-toolbar">
      <AppBar color="inherit" position="fixed" className={classes.appBar}>
        <Toolbar>
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
              src={wordmarkState()}
              alt="ASReview LAB Dashboard"
              onClick={() => {
                props.handleAppState("projects");
              }}
            />
          </ButtonBase>
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />
    </Box>
  );
};

export default connect(mapStateToProps)(Header);
