import React from "react";
import {
  AppBar,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { fade, makeStyles } from "@material-ui/core/styles";

import { ArrowBack, Close, Help, Search } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  toolBar: {
    marginRight: -12,
  },
  title: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    flex: 1,
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const AppBarWithinDialog = (props) => {
  const classes = useStyles();

  const onSearch = (event) => {
    props.setSearchQuery(event.target.value);
  };

  return (
    <AppBar className={classes.appBar}>
      <Toolbar className={classes.toolBar}>
        {/*Icon on the left*/}
        <IconButton
          edge="start"
          color="inherit"
          onClick={props.startIconAction}
        >
          {props.startIconIsClose ? <Close /> : <ArrowBack />}
        </IconButton>

        {/*Dialog title*/}
        <Typography className={classes.title} variant="h6">
          {props.title ? props.title : null}
        </Typography>

        {/*Search field*/}
        {props.searchField ? (
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <Search />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
              onChange={onSearch}
            />
          </div>
        ) : null}

        {/*Help icon*/}
        {props.helpIcon ? (
          <IconButton
            color="inherit"
            href={props.helpIconAction}
            target="_blank"
          >
            <Help />
          </IconButton>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default AppBarWithinDialog;
