import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import { ProjectDeleteDialog } from "ProjectComponents";
import { SetupDialog } from "ProjectComponents/SetupComponents";
import { ProjectAPI } from "api";
import { formatDate, projectModes, projectStatuses } from "globals.js";
import { useRowsPerPage } from "hooks/SettingsHooks";
import useAuth from "hooks/useAuth";
import { useToggle } from "hooks/useToggle";
import { ProjectCheckDialog, TableRowButton } from ".";

const PREFIX = "ProjectTable";

const classes = {
  root: `${PREFIX}-root`,
  error: `${PREFIX}-error`,
  table: `${PREFIX}-table`,
  tableCell: `${PREFIX}-tableCell`,
  converting: `${PREFIX}-converting`,
  img: `${PREFIX}-img`,
  title: `${PREFIX}-title`,
  titleWrapper: `${PREFIX}-title-wrapper`,
  loadingProjects: `${PREFIX}-loading-projects`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 64,
  },

  [`& .${classes.error}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 132,
  },

  [`& .${classes.table}`]: {
    minWidth: 700,
  },

  [`& .${classes.tableCell}`]: {
    letterSpacing: "0.25px",
  },

  [`& .${classes.converting}`]: {
    display: "flex",
    alignItems: "center",
  },

  [`& .${classes.title}`]: {
    cursor: "pointer",
    display: "-webkit-box",
    letterSpacing: "0.25px",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 1,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },

  [`& .${classes.titleWrapper}`]: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },

  [`& .${classes.loadingProjects}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 248,
  },
}));

const columns = [
  { id: "name", label: "Project", width: "55%" },
  { id: "created_at_unix", label: "Date", width: "15%" },
  { id: "status", label: "Status", width: "15%" },
];

const StatusChip = ({ status }) => {
  switch (status) {
    case projectStatuses.SETUP:
      return (
        <Chip
          size="small"
          label="Setup"
          sx={{ color: "#424242", backgroundColor: "#bdbdbd" }}
        />
      );
    case projectStatuses.REVIEW:
      return (
        <Chip
          size="small"
          label="In Review"
          sx={{ color: "#91620b", backgroundColor: "#fffbe7" }}
        />
      );
    case projectStatuses.FINISHED:
      return (
        <Chip
          size="small"
          label="Finished"
          sx={{ color: "#007b55", backgroundColor: "#e1fae3" }}
        />
      );
    default:
      return null;
  }
};

const ProjectTable = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  const [page] = React.useState(0);
  const [rowsPerPage] = useRowsPerPage();
  const [setupDialogState, setSetupDialogState] = React.useState({
    open: false,
    project_info: null,
  });

  const [onDeleteDialog, toggleDeleteDialog] = useToggle();

  const { data, isError, isFetched, isFetching, isSuccess } = useQuery(
    ["fetchProjects", { subset: props.mode }],
    ProjectAPI.fetchProjects,
    {
      refetchOnWindowFocus: false,
    },
  );

  const openProject = (project, path) => {
    if (
      project["reviews"][0] &&
      project["reviews"][0]["status"] === projectStatuses.SETUP
    ) {
      setSetupDialogState({
        open: true,
        project_info: project,
      });
    } else if (!project["projectNeedsUpgrade"]) {
      // open project page
      navigate(`${project["id"]}/${path}`);
    } else {
      // open project check dialog
      props.setProjectCheck({
        open: true,
        issue: "upgrade",
        path: path,
        project_id: project["id"],
      });
    }
  };

  return (
    <StyledPaper elevation={2} className={classes.root}>
      <TableContainer>
        <Table className={classes.table} stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} style={{ width: column.width }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isError &&
              !isFetching &&
              isFetched &&
              isSuccess &&
              data.result
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  // if we do authentication, then we need to know who the owner is
                  row["owner_id"] =
                    window.authentication && "owner_id" in row
                      ? row["owner_id"]
                      : false;
                  // A collaborator can not edit
                  const isOwner =
                    window.authentication && row["owner_id"] === auth.id;

                  const isSimulating = () => {
                    return (
                      row["mode"] === projectModes.SIMULATION &&
                      row["reviews"] &&
                      row["reviews"][0] &&
                      row["reviews"][0]["status"] === projectStatuses.REVIEW
                    );
                  };

                  const showReviewButton = () => {
                    return (
                      row["reviews"] &&
                      row["reviews"][0] &&
                      row["reviews"][0]["status"] === projectStatuses.REVIEW
                    );
                  };

                  const disableProjectStatusChange = () => {
                    return (
                      row["projectNeedsUpgrade"] ||
                      row["mode"] === projectModes.SIMULATION ||
                      !row["reviews"] ||
                      !row["reviews"][0] ||
                      row["reviews"][0]["status"] === projectStatuses.SETUP
                    );
                  };

                  const onClickProjectExport = () => {
                    if (
                      row["reviews"] &&
                      row["reviews"][0] &&
                      row["reviews"][0]["status"] === projectStatuses.SETUP
                    ) {
                      queryClient.prefetchQuery(
                        ["fetchExportProject", { project_id: row["id"] }],
                        ProjectAPI.fetchExportProject,
                      );
                    } else {
                      openProject(row, "export");
                    }
                  };

                  const onClickProjectDetails = () => {
                    openProject(row, "settings");
                  };

                  // const updateProjectStatus = () => {
                  //   handleChangeStatus(row);
                  // };
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell sx={{ display: "flex" }}>
                        <Box className={classes.titleWrapper}>
                          <Typography
                            onClick={() => {
                              openProject(row, "");
                            }}
                            className={classes.title}
                            variant="subtitle1"
                          >
                            {row["name"]}
                          </Typography>
                          <Box sx={{ flex: 1 }}></Box>
                          <TableRowButton
                            disableProjectStatusChange={
                              disableProjectStatusChange
                            }
                            isSimulating={isSimulating}
                            isOwner={isOwner}
                            showReviewButton={showReviewButton}
                            onClickCollaboration={() => {
                              openProject(row, "team");
                            }}
                            onClickEndCollaboration={() => {
                              openProject(row, "team");
                            }} /* !!!!!!!!! */
                            onClickProjectReview={() => {
                              openProject(row, "review");
                            }}
                            onClickProjectExport={onClickProjectExport}
                            onClickProjectDetails={onClickProjectDetails}
                            projectStatus={
                              row["reviews"] && row["reviews"][0]
                                ? row["reviews"][0]["status"]
                                : null
                            }
                            toggleDeleteDialog={toggleDeleteDialog}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          className={classes.tableCell}
                          variant="subtitle1"
                          noWrap
                        >
                          {formatDate(row["created_at_unix"])}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <StatusChip
                          size="small"
                          status={
                            row["reviews"] && row["reviews"][0]
                              ? row["reviews"][0]["status"]
                              : null
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>
      <SetupDialog
        projectInfo={setupDialogState.project_info}
        mode={props.mode}
        mobileScreen={props.mobileScreen}
        open={setupDialogState.open}
        onClose={() => {
          setSetupDialogState({ open: false, project_info: null });
        }}
        setFeedbackBar={props.setFeedbackBar}
        key={"setup-dialog-" + setupDialogState.project_info?.id}
      />
      <ProjectCheckDialog
        projectCheck={props.projectCheck}
        setProjectCheck={props.setProjectCheck}
      />
      <ProjectDeleteDialog
        onDeleteDialog={onDeleteDialog}
        toggleDeleteDialog={toggleDeleteDialog}
        projectTitle={null}
        project_id={null}
      />
    </StyledPaper>
  );
};

export default ProjectTable;
