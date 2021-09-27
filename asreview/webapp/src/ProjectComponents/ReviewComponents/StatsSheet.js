import React from "react";
import { Drawer, Hidden, IconButton, Toolbar, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { Close } from "@mui/icons-material";

import { ProgressPanel, ProjectPanel } from "../../SideStats";

import { drawerWidth } from "../../globals.js";

import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    paddingLeft: 16,
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
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const mapStateToProps = (state) => {
  return { project_id: state.project_id };
};

const StatsSheet = (props) => {
  const { window } = props;
  const classes = useStyles();

  const drawer = (
    <div>
      {!props.mobileScreen && (
        <div>
          <Toolbar />
          <div className={classes.drawerHeader}>
            <div className={classes.drawerTitle}>
              <Typography variant="subtitle1">
                <b>Statistics</b>
              </Typography>
            </div>
            <IconButton onClick={props.toggleSideSheet} size="large">
              <Close fontSize="small" />
            </IconButton>
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
          sideSheetError={props.sideSheetError}
          setSideSheetError={props.setSideSheetError}
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
          open={props.mobileScreen && props.onSideSheet}
          onClose={props.toggleSideSheet}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>

      <Hidden smDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="persistent"
          anchor="right"
          open={!props.mobileScreen && props.onSideSheet}
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default connect(mapStateToProps)(StatsSheet);
