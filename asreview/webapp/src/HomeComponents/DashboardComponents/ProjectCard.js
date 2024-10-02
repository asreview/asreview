import {
  DeleteForeverOutlined,
  DoneAllOutlined,
  DownloadOutlined,
  GroupAdd,
  MoreHoriz,
  PersonOff,
  SettingsOutlined,
} from "@mui/icons-material";
import { ProjectAPI } from "api";
import { projectModes, projectStatuses } from "globals.js";
import { useToggle } from "hooks/useToggle";
import { ProjectDeleteDialog } from "ProjectComponents";
import { SetupDialog } from "ProjectComponents/SetupComponents";
import * as React from "react";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";

import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const StatusChip = ({ status }) => {
  switch (status) {
    case projectStatuses.SETUP:
      return (
        <Chip
          // size="small"
          label="Setup"
          sx={{ color: "#424242", backgroundColor: "#bdbdbd" }}
        />
      );
    case projectStatuses.REVIEW:
      return (
        <Chip
          // size="small"
          label="In Review"
          sx={{ color: "#91620b", backgroundColor: "#fffbe7" }}
        />
      );
    case projectStatuses.FINISHED:
      return (
        <Chip
          // size="small"
          label="Finished"
          sx={{ color: "#007b55", backgroundColor: "#e1fae3" }}
        />
      );
    default:
      return null;
  }
};

const projectModeURLMap = {
  oracle: "reviews",
  simulate: "simulations",
};

const ProjectCard = ({
  project,
  mode,
  user_id,
  showProgressChip = true,
  showSimulatingSpinner = true,
}) => {
  const navigate = useNavigate();

  const [deleteDialog, toggleDeleteDialog] = useToggle();
  const [openSetup, toggleSetup] = useToggle();

  const review = project["reviews"][0];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openProject = (project, path) => {
    if (review?.status === projectStatuses.SETUP) {
      toggleSetup();
    } else {
      navigate(`${project.id}/${path}`);
    }
  };

  const handleClickUpdateStatus = () => {
    handleMenuClose();
    // props.updateProjectStatus();
  };

  const handleClickDelete = () => {
    handleMenuClose();
    toggleDeleteDialog();
  };

  const [exporting, setExporting] = React.useState(false);

  const {
    // error: exportProjectError,
    // isError: isExportProjectError,
    isFetching: isExportingProject,
  } = useQuery(
    ["fetchExportProject", { project_id: project.id }],
    ProjectAPI.fetchExportProject,
    {
      enabled: exporting,
      refetchOnWindowFocus: false,
      onSettled: () => {
        setExporting(false);
        handleMenuClose();
      },
    },
  );

  return (
    <Card
      sx={(theme) => ({
        width: "100%",
        bgcolor: theme.palette.background.default,
      })}
    >
      <CardHeader
        title={
          <Typography
            onClick={() => {
              openProject(project, "");
            }}
          >
            {project["name"]}
          </Typography>
        }
        subheader={timeAgo.format(new Date(project.datetimeCreated))}
        // avatar={
        //   <>
        //     {review?.status === projectStatuses.SETUP && (
        //       <Tooltip title="Project in setup">
        //         <Avatar sx={{}} aria-label="status">
        //           {/* <AssignmentOutlined /> */}
        //         </Avatar>
        //       </Tooltip>
        //     )}
        //     {review?.status === projectStatuses.REVIEW && (
        //       <Tooltip title="Project in review">
        //         <Avatar sx={{}} aria-label="status">
        //           <AssignmentOutlined />
        //         </Avatar>
        //       </Tooltip>
        //     )}
        //     {review?.status === projectStatuses.FINISHED && (
        //       <Tooltip title="Finished project">
        //         <Avatar sx={{}} aria-label="status">
        //           <AssignmentTurnedInOutlinedIcon />
        //         </Avatar>
        //       </Tooltip>
        //     )}
        //   </>
        // }
      />
      {/* <CardContent>
         <StatusChip size="small" status={review?.status} />
        {review?.status === projectStatuses.REVIEW &&
          project.mode !== projectModes.SIMULATION && (
            <Tooltip title="Review">
              <Button
                variant="contained"
                component={Link}
                to={`/${projectModeURLMap[mode]}/${project.id}/review`}
              >
                Review
              </Button>
            </Tooltip>
          )}
        {review?.status === projectStatuses.SETUP && (
          <Tooltip title="Finish project setup">
            <Button variant="outlined" onClick={() => {}}>
              Finish setup
            </Button>
          </Tooltip>
        )}
      </CardContent> */}
      <CardContent>
        {/* <Typography variant="body2" color="textSecondary" component="p">
          {project.description}
        </Typography> */}
        {showSimulatingSpinner &&
        review?.status === projectStatuses.REVIEW &&
        project.mode === projectModes.SIMULATION ? (
          <LinearProgress />
        ) : null}
      </CardContent>
      <CardActions sx={{ width: "100%", justifyContent: "flex-end" }}>
        {showProgressChip && <StatusChip status={review?.status} />}

        <>
          <Tooltip title="Options">
            <IconButton
              id="card-positioned-button"
              aria-controls={openMenu ? "card-positioned-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? "true" : undefined}
              onClick={handleClick}
            >
              <MoreHoriz />
            </IconButton>
          </Tooltip>

          <Menu
            id="card-positioned-menu"
            aria-labelledby="card-positioned-button"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            {/* {review?.status !== projectStatuses.SETUP && (
              <MenuItem
                component={Link}
                to={`/${projectModeURLMap[mode]}/${project.id}/collection`}
                disabled={
                  mode === projectModes.SIMULATION &&
                  review?.status === projectStatuses.REVIEW
                }
              >
                Download records
              </MenuItem>
            )} */}

            {mode === projectModes.ORACLE &&
              review?.status !== projectStatuses.SETUP && (
                <MenuItem onClick={handleClickUpdateStatus}>
                  <ListItemIcon>
                    <DoneAllOutlined />
                  </ListItemIcon>
                  <ListItemText>
                    {review?.status === projectStatuses.REVIEW
                      ? "Mark as finished"
                      : "Mark as in review"}
                  </ListItemText>
                </MenuItem>
              )}

            <MenuItem
              onClick={() => {
                setExporting(true);
              }}
              disabled={isExportingProject}
            >
              <ListItemIcon>
                <DownloadOutlined />
              </ListItemIcon>
              <ListItemText>Export</ListItemText>
            </MenuItem>
            {review?.status !== projectStatuses.SETUP &&
              !(
                mode === projectModes.SIMULATION &&
                review?.status === projectStatuses.REVIEW
              ) && (
                <MenuItem
                  component={Link}
                  to={`/${projectModeURLMap[mode]}/${project.id}/settings`}
                >
                  <ListItemIcon>
                    <SettingsOutlined />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
              )}
            <MenuItem
              onClick={handleClickDelete}
              disabled={project?.owner_id !== user_id}
            >
              <ListItemIcon>
                <DeleteForeverOutlined />
              </ListItemIcon>
              <ListItemText>Delete project</ListItemText>
            </MenuItem>
          </Menu>
        </>

        {window.authentication &&
          review?.status !== projectStatuses.SETUP &&
          project?.owner_id === user_id && (
            <Tooltip title="Add team members">
              <IconButton
                component={Link}
                to={`/${projectModeURLMap[mode]}/${project.id}/team`}
              >
                <GroupAdd />
              </IconButton>
            </Tooltip>
          )}
        {window.authentication &&
          review?.status !== projectStatuses.SETUP &&
          project?.owner_id !== user_id && (
            <Tooltip title="Remove yourself from project">
              <IconButton
                component={Link}
                to={`/${projectModeURLMap[mode]}/${project.id}/team`}
              >
                <PersonOff />
              </IconButton>
            </Tooltip>
          )}
      </CardActions>
      {review?.status === projectStatuses.SETUP && (
        <SetupDialog
          mode={mode}
          projectInfo={project}
          open={openSetup}
          onClose={toggleSetup}
        />
      )}
      <ProjectDeleteDialog
        project_id={project.id}
        projectTitle={project.name}
        open={deleteDialog}
        onClose={toggleDeleteDialog}
      />
    </Card>
  );
};

export default ProjectCard;
