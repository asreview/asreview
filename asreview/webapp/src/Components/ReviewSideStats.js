import React from "react";
import {
  Drawer,
  Hidden,
  IconButton,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { ChevronRight } from "@material-ui/icons";

import { ProgressPanel, ProjectPanel } from "../SideStats";

import { reviewDrawerWidth } from "../globals.js";

import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: reviewDrawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: reviewDrawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  },
  drawerTitle: {
    width: "100%",
  },
  drawerItems: {
    "& > *": {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const mapStateToProps = (state) => {
  return { project_id: state.project_id };
};

const ReviewSideStats = (props) => {
  const { window } = props;
  const classes = useStyles();

  const drawer = (
    <div>
      {!props.mobile && (
        <div>
          <Toolbar />
          <div className={classes.drawerHeader}>
            <IconButton onClick={props.toggleSideStats}>
              <ChevronRight />
            </IconButton>
            <div className={classes.drawerTitle}>
              <Typography variant="h6">Statistics</Typography>
            </div>
          </div>
        </div>
      )}
      <div className={classes.drawerItems}>
        <ProjectPanel
          name={props.statistics.name}
          authors={props.statistics.authors}
        />
        <ProgressPanel
          n_included={props.statistics.n_included}
          n_excluded={props.statistics.n_excluded}
          n_papers={props.statistics.n_papers}
          n_since_last_inclusion={props.statistics.n_since_last_inclusion}
          history={props.history}
          sideStatsError={props.sideStatsError}
          setSideStatsError={props.setSideStatsError}
        />
      </div>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <nav className={classes.drawer}>
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor="right"
          open={props.mobile && props.onSideStats}
          onClose={props.toggleSideStats}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>

      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="persistent"
          anchor="right"
          open={!props.mobile && props.onSideStats}
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default connect(mapStateToProps)(ReviewSideStats);
