import React from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { fade, makeStyles } from "@material-ui/core/styles";

import {
  ArrowBack,
  Close,
  HelpOutlineOutlined,
  History,
  Search,
  ShowChart,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: "hidden",
    zIndex: theme.zIndex.drawer + 1,
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
    backgroundColor: [
      theme.palette.type === "dark"
        ? fade(theme.palette.common.white, 0.15)
        : fade(theme.palette.common.black, 0.075),
    ],
    "&:hover": {
      backgroundColor: [
        theme.palette.type === "dark"
          ? fade(theme.palette.common.white, 0.25)
          : fade(theme.palette.common.black, 0.125),
      ],
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
  divider: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
  },
}));

const AppBarWithinDialog = React.forwardRef(
  (
    {
      color,
      onChangeSearch,
      onChangeSelect,
      onClickHelp,
      onClickHistory,
      onClickShowChart,
      onClickStartIcon,
      selectOptions,
      selectedValue,
      startIconIsClose,
      title,
    },
    ref
  ) => {
    const classes = useStyles();

    return (
      <AppBar className={classes.root} color={color} position="relative">
        <Toolbar className={classes.toolBar}>
          {/* Start icon */}
          <IconButton edge="start" color="inherit" onClick={onClickStartIcon}>
            {startIconIsClose ? <Close /> : <ArrowBack />}
          </IconButton>

          {/* Dialog title */}
          {!onChangeSelect && title && (
            <Typography className={classes.title} variant="h6">
              {title}
            </Typography>
          )}

          {/* Select */}
          {onChangeSelect && (
            <div className={classes.select}>
              <FormControl>
                <Select value={selectedValue} onChange={onChangeSelect}>
                  {selectOptions.map((element, index) => (
                    <MenuItem key={element.value} value={element.value}>
                      {element.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}

          {/* Divider */}
          {!title && <div className={classes.divider}></div>}

          {/* Search field */}
          {onChangeSearch && (
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
                onChange={onChangeSearch}
              />
            </div>
          )}

          {/* History icon */}
          {onClickHistory && (
            <Tooltip title="Review history">
              <IconButton color="inherit" onClick={onClickHistory}>
                <History />
              </IconButton>
            </Tooltip>
          )}

          {/* Show chart icon */}
          {onClickShowChart && (
            <Tooltip title="Statistics">
              <IconButton color="inherit" onClick={onClickShowChart}>
                <ShowChart />
              </IconButton>
            </Tooltip>
          )}

          {/* Help icon */}
          {onClickHelp && (
            <IconButton color="inherit" href={onClickHelp} target="_blank">
              <HelpOutlineOutlined />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
    );
  }
);

AppBarWithinDialog.propTypes = {
  color: PropTypes.string,
  onChangeSearch: PropTypes.func,
  onChangeSelect: PropTypes.func,
  onClickHelp: PropTypes.string,
  onClickHistory: PropTypes.func,
  onClickShowChart: PropTypes.func,
  onClickStartIcon: PropTypes.func.isRequired,
  selectOptions: PropTypes.array,
  selectedValue: PropTypes.number,
  startIconIsClose: PropTypes.bool,
  title: PropTypes.string,
};

AppBarWithinDialog.defaultProps = {
  color: "inherit",
  startIconIsClose: true,
};

AppBarWithinDialog.displayName = "AppBarWithinDialog";

export default AppBarWithinDialog;
