import * as React from "react";
import {
  useMatch,
  useNavigate,
  useParams,
  useResolvedPath,
} from "react-router-dom";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowBackOutlined,
  AssignmentOutlined,
  AssessmentOutlined,
  DashboardOutlined,
  SettingsOutlined,
  LibraryBooksOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";

const PREFIX = "DrawerItem";

const classes = {
  root: `${PREFIX}-root`,
  icon: `${PREFIX}-icon`,
  textSelected: `${PREFIX}-textSelected`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    [`:before`]: {
      top: 0,
      left: 0,
      width: 4,
      height: "100%",
      content: "' '",
      position: "absolute",
      backgroundColor: theme.palette.primary.main,
    },
  },

  [`& .${classes.icon}`]: {
    paddingLeft: 8,
  },

  [`& .${classes.textSelected}`]: {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const DrawerItem = (props) => {
  const navigate = useNavigate();
  const { project_id } = useParams();

  const resolved = useResolvedPath(props.path);
  const match = useMatch({ path: resolved.pathname, end: true });

  const returnIconState = () => {
    // home page navigation
    if (
      !project_id &&
      (props.label === "Reviews" ||
        props.label === "Validations" ||
        props.label === "Simulations")
    ) {
      return (
        <DashboardOutlined color={match !== null ? "primary" : "inherit"} />
      );
    }

    // project page navigation
    if (
      project_id &&
      (props.label === "reviews" ||
        props.label === "validations" ||
        props.label === "simulations")
    ) {
      return <ArrowBackOutlined />;
    }
    if (props.label === "Dashboard") {
      return (
        <AssessmentOutlined color={match !== null ? "primary" : "inherit"} />
      );
    }
    if (props.label === "Review") {
      return (
        <AssignmentOutlined color={match !== null ? "primary" : "inherit"} />
      );
    }
    if (props.label === "Collection") {
      return (
        <LibraryBooksOutlined color={match !== null ? "primary" : "inherit"} />
      );
    }
    if (props.label === "Team") {
      return (
        <PeopleAltOutlined color={match !== null ? "primary" : "inherit"} />
      );
    }
    if (props.label === "Settings") {
      return (
        <SettingsOutlined color={match !== null ? "primary" : "inherit"} />
      );
    }
  };

  return (
    <Root>
      <Tooltip
        disableHoverListener={props.onNavDrawer}
        title={props.label}
        placement="right"
      >
        <ListItemButton
          selected={match !== null}
          onClick={() => {
            if (props.mobileScreen) {
              props.toggleNavDrawer();
            }
            navigate(props.path);
          }}
          className={match !== null ? classes.root : null}
        >
          <ListItemIcon className={classes.icon}>
            {returnIconState()}
          </ListItemIcon>
          <ListItemText
            primary={props.label}
            primaryTypographyProps={{
              className: match !== null ? classes.textSelected : null,
            }}
          />
        </ListItemButton>
      </Tooltip>
    </Root>
  );
};

export default DrawerItem;
