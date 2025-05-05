import {
  DeleteForeverOutlined,
  DoneAllOutlined,
  EditOutlined,
  FileDownloadOutlined,
  GroupAddOutlined,
  MoreHoriz,
  PersonOffOutlined,
  RemoveDoneOutlined,
} from "@mui/icons-material";
import { ProjectAPI } from "api";
import { projectModes, projectStatuses } from "globals.js";
import { useToggle } from "hooks/useToggle";
import ReviewScreenOutlined from "icons/ReviewScreenOutlined";
import { ProjectDeleteDialog, ProjectRenameDialog } from "ProjectComponents";
import { SetupDialog } from "ProjectComponents/SetupComponents";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  ButtonBase,
  Card,
  Chip,
  Grid2 as Grid,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const projectModeURLMap = {
  oracle: "reviews",
  simulate: "simulations",
};

const ProjectCard = ({ project, mode, showSimulatingSpinner = true }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const largeScreen = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const [deleteDialog, toggleDeleteDialog] = useToggle();
  const [openSetup, toggleSetup] = useToggle();
  const [renameDialog, toggleRenameDialog] = useToggle();
  const [exporting, setExporting] = React.useState(false);

  const review = project["reviews"][0];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);

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
        setAnchorEl(null);
      },
    },
  );

  const openProject = (path = "") => {
    if (review?.status === projectStatuses.SETUP) {
      toggleSetup();
    } else {
      navigate(`${project.id}/${path}`);
    }
  };

  const { mutate: handleClickUpdateStatus } = useMutation(
    ProjectAPI.mutateReviewStatus,
    {
      onSuccess: (data) => {
        queryClient.setQueryData(
          ["fetchProjectStatus", { project_id: project.id }],
          data,
        );
        queryClient.invalidateQueries([
          "fetchProjectInfo",
          { project_id: project.id },
        ]);
        queryClient.invalidateQueries("fetchProjects");
        setAnchorEl(null);
      },
    },
  );

  const handleClickDelete = () => {
    setAnchorEl(null);
    toggleDeleteDialog();
  };

  return (
    <Card
      sx={(theme) => ({
        width: "100%",
        p: 3,
      })}
      elevation={0}
    >
      <Grid container spacing={3} columns={14} alignItems={"center"}>
        <Grid size="grow">
          <ButtonBase
            onClick={(e) => openProject()}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Stack direction={"row"} spacing={1} sx={{ width: "100%" }}>
              <Box sx={{ width: "100%" }}>
                <Typography
                  fontSize={"1.4rem"}
                  sx={{
                    textAlign: "left",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {project?.name}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="textSecondary" component="p">
              {timeAgo.format(project.created_at_unix * 1000)}
            </Typography>
          </ButtonBase>
        </Grid>
        {mode === projectModes.ORACLE &&
          review?.status === projectStatuses.REVIEW &&
          largeScreen && (
            <Grid size={"auto"}>
              <Button
                onClick={() => openProject("reviewer")}
                variant="outlined"
                color="secondary"
                sx={{ borderRadius: 20 }}
                endIcon={<ReviewScreenOutlined />}
              >
                Review
              </Button>
            </Grid>
          )}

        <Grid size={"auto"}>
          {review?.status === projectStatuses.SETUP && (
            <ButtonBase
              onClick={(e) => openProject()}
              sx={{ borderRadius: "16px", mr: 1 }}
            >
              <Chip
                label="Draft"
                sx={{ color: "#424242", bgcolor: "#bdbdbd" }}
                clickable={false}
              />
            </ButtonBase>
          )}
          {window.authentication &&
            review?.status !== projectStatuses.SETUP &&
            project?.roles.owner && (
              <Tooltip title="Add team members">
                <IconButton
                  component={Link}
                  to={`/${projectModeURLMap[mode]}/${project.id}/team`}
                >
                  <GroupAddOutlined />
                </IconButton>
              </Tooltip>
            )}
          {window.authentication &&
            review?.status !== projectStatuses.SETUP &&
            !project?.roles.owner && (
              <Tooltip title="Remove yourself from project">
                <IconButton
                  component={Link}
                  to={`/${projectModeURLMap[mode]}/${project.id}/team`}
                >
                  <PersonOffOutlined />
                </IconButton>
              </Tooltip>
            )}
          <>
            <Tooltip title="Options">
              <IconButton
                id="more-options-button"
                aria-controls={openMenu ? "more-options-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? "true" : undefined}
                onClick={(event) => {
                  setAnchorEl(event.currentTarget);
                }}
              >
                <MoreHoriz />
              </IconButton>
            </Tooltip>
            <Menu
              id="card-positioned-menu"
              aria-labelledby="card-positioned-button"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={() => {
                setAnchorEl(null);
              }}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  toggleRenameDialog();
                }}
              >
                <ListItemIcon>
                  <EditOutlined />
                </ListItemIcon>
                <ListItemText>Rename project</ListItemText>
              </MenuItem>
              {mode === projectModes.ORACLE &&
                review?.status !== projectStatuses.SETUP && (
                  <MenuItem
                    onClick={() =>
                      handleClickUpdateStatus({
                        project_id: project.id,
                        status:
                          review?.status === projectStatuses.REVIEW
                            ? projectStatuses.FINISHED
                            : projectStatuses.REVIEW,
                      })
                    }
                  >
                    <ListItemIcon>
                      {review?.status === projectStatuses.REVIEW ? (
                        <DoneAllOutlined />
                      ) : (
                        <RemoveDoneOutlined />
                      )}
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
                  <FileDownloadOutlined />
                </ListItemIcon>
                <ListItemText>Export project</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={handleClickDelete}
                disabled={!project?.roles.owner}
              >
                <ListItemIcon>
                  <DeleteForeverOutlined />
                </ListItemIcon>
                <ListItemText>Delete project</ListItemText>
              </MenuItem>
            </Menu>
          </>
        </Grid>
      </Grid>

      {/* Add loading for simulation projects */}
      {showSimulatingSpinner &&
      review?.status === projectStatuses.REVIEW &&
      project.mode === projectModes.SIMULATION ? (
        <LinearProgress />
      ) : null}

      {review?.status === projectStatuses.SETUP && (
        <SetupDialog
          project_id={project.id}
          mode={mode}
          open={openSetup}
          onClose={toggleSetup}
        />
      )}
      <ProjectRenameDialog
        project_id={project.id}
        projectTitle={project.name}
        open={renameDialog}
        onClose={toggleRenameDialog}
      />
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
