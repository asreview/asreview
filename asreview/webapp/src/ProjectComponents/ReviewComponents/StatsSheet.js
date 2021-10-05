import React from "react";
import { connect } from "react-redux";
import { Drawer, Hidden, IconButton, Toolbar, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Close } from "@mui/icons-material";

import { ProgressPanel, ProjectPanel } from "../../SideStats";

import { drawerWidth } from "../../globals.js";

const PREFIX = "StatsSheet";

const classes = {
  drawer: `${PREFIX}-drawer`,
  drawerPaper: `${PREFIX}-drawerPaper`,
  drawerHeader: `${PREFIX}-drawerHeader`,
  drawerTitle: `${PREFIX}-drawerTitle`,
  drawerItems: `${PREFIX}-drawerItems`,
};

const Root = styled("nav")(({ theme }) => ({
  [`&.${classes.drawer}`]: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },

  [`& .${classes.drawerPaper}`]: {
    width: drawerWidth,
  },

  [`& .${classes.drawerHeader}`]: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    paddingLeft: 16,
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  },

  [`& .${classes.drawerTitle}`]: {
    width: "100%",
  },

  [`& .${classes.drawerItems}`]: {
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
    <Root className={classes.drawer}>
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
    </Root>
  );
};

export default connect(mapStateToProps)(StatsSheet);
