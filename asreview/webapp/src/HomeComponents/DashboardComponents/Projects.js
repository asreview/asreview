import { GroupAdd, MoreHoriz, PersonOff } from "@mui/icons-material";
import { ProjectDeleteDialog } from "ProjectComponents";
import { ProjectAPI } from "api";
import { projectModes, projectStatuses } from "globals.js";
import useAuth from "hooks/useAuth";
import { useToggle } from "hooks/useToggle";
import * as React from "react";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { SetupDialog } from "ProjectComponents/SetupComponents";

import {
  Card,
  CardActions,
  CardHeader,
  Chip,
  Grid2 as Grid,
  IconButton,
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

const ProjectCard = ({ project, mode, user_id, setFeedbackBar }) => {
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
      console.log("open setup");
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
      <CardActions sx={{ width: "100%", justifyContent: "flex-end" }}>
        <StatusChip status={review?.status} />

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
            {review?.status !== projectStatuses.SETUP && (
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
            )}

            {mode === projectModes.ORACLE &&
              review?.status !== projectStatuses.SETUP && (
                <MenuItem onClick={handleClickUpdateStatus}>
                  {review?.status === projectStatuses.REVIEW
                    ? "Mark as finished"
                    : "Mark as in review"}
                </MenuItem>
              )}

            {review?.status !== projectStatuses.SETUP &&
              !(
                mode === projectModes.SIMULATION &&
                review?.status === projectStatuses.REVIEW
              ) && (
                <MenuItem
                  component={Link}
                  to={`/${projectModeURLMap[mode]}/${project.id}/settings`}
                >
                  Settings
                </MenuItem>
              )}
            <MenuItem
              onClick={handleClickDelete}
              disabled={project?.owner_id !== user_id}
            >
              Delete project
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
          setFeedbackBar={setFeedbackBar}
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

const Projects = ({ mode, setFeedbackBar }) => {
  const { auth } = useAuth();
  const user_id = auth.id;

  const { data } = useQuery(
    ["fetchProjects", { subset: mode }],
    ProjectAPI.fetchProjects,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Grid container spacing={2}>
      {data?.result.map((project) => (
        <Grid
          key={project.id}
          size={{
            xs: 12,
            sm: 6,
            md: 6,
          }}
        >
          <ProjectCard
            project={project}
            mode={mode}
            user_id={user_id}
            setFeedbackBar={setFeedbackBar}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default Projects;
