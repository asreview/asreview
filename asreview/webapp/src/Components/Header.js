import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppBar, ButtonBase, Toolbar, IconButton } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Menu } from "@mui/icons-material";

import ASReviewLAB_black from "../images/asreview_sub_logo_lab_black_transparent.svg";
import ASReviewLAB_white from "../images/asreview_sub_logo_lab_white_transparent.svg";

const PREFIX = "Header";

const classes = {
  appBar: `${PREFIX}-appBar`,
  menuButton: `${PREFIX}-menuButton`,
  logo: `${PREFIX}-logo`,
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
}));

const mapStateToProps = (state) => {
  return {
    app_state: state.app_state,
  };
};

const Header = (props) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const wordmarkState = () => {
    if (theme.palette.mode === "dark") {
      return ASReviewLAB_white;
    } else {
      return ASReviewLAB_black;
    }
  };

  return (
    <Root aria-label="appbar-toolbar">
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
                navigate("/");
              }}
            />
          </ButtonBase>
        </Toolbar>
      </AppBar>
      <Toolbar aria-label="placeholder toolbar" />
    </Root>
  );
};

export default connect(mapStateToProps)(Header);
