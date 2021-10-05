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
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import {
  ArrowBack,
  Close,
  Help,
  History,
  Search,
  ShowChart,
} from "@mui/icons-material";

const PREFIX = "AppBarWithinDialog";

const classes = {
  root: `${PREFIX}-root`,
  toolBar: `${PREFIX}-toolBar`,
  title: `${PREFIX}-title`,
  select: `${PREFIX}-select`,
  search: `${PREFIX}-search`,
  searchIcon: `${PREFIX}-searchIcon`,
  inputRoot: `${PREFIX}-inputRoot`,
  inputInput: `${PREFIX}-inputInput`,
  divider: `${PREFIX}-divider`,
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [`&.${classes.root}`]: {
    overflow: "hidden",
    zIndex: theme.zIndex.drawer + 1,
  },

  [`& .${classes.toolBar}`]: {
    marginRight: -12,
  },

  [`& .${classes.title}`]: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    flexGrow: 1,
  },

  [`& .${classes.select}`]: {
    margin: theme.spacing(1),
    flexGrow: 1,
  },

  [`& .${classes.search}`]: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: [
      theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.15)
        : alpha(theme.palette.common.black, 0.075),
    ],
    "&:hover": {
      backgroundColor: [
        theme.palette.mode === "dark"
          ? alpha(theme.palette.common.white, 0.25)
          : alpha(theme.palette.common.black, 0.125),
      ],
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },

  [`& .${classes.searchIcon}`]: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.inputRoot}`]: {
    color: "inherit",
  },

  [`& .${classes.inputInput}`]: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },

  [`& .${classes.divider}`]: {
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
    return (
      <StyledAppBar className={classes.root} color={color} position="relative">
        <Toolbar className={classes.toolBar}>
          {/* Start icon */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClickStartIcon}
            size="large"
          >
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
              <IconButton color="inherit" onClick={onClickHistory} size="large">
                <History />
              </IconButton>
            </Tooltip>
          )}

          {/* Show chart icon */}
          {onClickShowChart && (
            <Tooltip title="Statistics">
              <IconButton
                color="inherit"
                onClick={onClickShowChart}
                size="large"
              >
                <ShowChart />
              </IconButton>
            </Tooltip>
          )}

          {/* Help icon */}
          {onClickHelp && (
            <IconButton
              color="inherit"
              href={onClickHelp}
              target="_blank"
              size="large"
            >
              <Help />
            </IconButton>
          )}
        </Toolbar>
      </StyledAppBar>
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
