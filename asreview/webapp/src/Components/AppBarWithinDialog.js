import React from "react";
import {
  AppBar,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { fade, makeStyles } from "@material-ui/core/styles";

import {
  ArrowBack,
  Close,
  HelpOutlineOutlined,
  Search,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: "hidden",
  },
  toolBar: {
    marginRight: -12,
  },
  title: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    flexGrow: 1,
  },
  select: {
    margin: theme.spacing(1),
    flexGrow: 1,
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

  return (
    <AppBar className={classes.root} color="inherit" position="relative">
      <Toolbar className={classes.toolBar}>
        {/*Icon on the left*/}
        <IconButton
          edge="start"
          color="inherit"
          onClick={props.handleStartIcon}
        >
          {props.onClose ? <Close /> : <ArrowBack />}
        </IconButton>

        {/*Dialog title*/}
        {!props.onSelect && props.title && (
          <Typography className={classes.title} variant="h6">
            {props.title}
          </Typography>
        )}

        {/*Select*/}
        {props.onSelect && (
          <div className={classes.select}>
            <FormControl>
              <Select value={props.selectValue} onChange={props.handleSelect}>
                {props.selectOptions.map((element, index) => (
                  <MenuItem key={element.value} value={element.value}>
                    {element.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/*Search field*/}
        {props.onSearchField && (
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
              onChange={props.handleSearch}
            />
          </div>
        )}

        {/*Help icon*/}
        {props.onHelp && (
          <IconButton color="inherit" href={props.handleHelp} target="_blank">
            <HelpOutlineOutlined />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppBarWithinDialog;
