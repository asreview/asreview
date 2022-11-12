import * as React from "react";
import { useMutation, useQuery, useQueries, useQueryClient } from "react-query";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { BoxErrorHandler, DialogErrorHandler } from "../../Components";
import { ProjectDeleteDialog } from "../../ProjectComponents";
import { ProjectCheckDialog, TableRowButton } from "../DashboardComponents";
import { InvitationDialog } from "../../ProjectComponents/CollaborationComponents";
import { ProjectAPI } from "../../api/index.js";
import { useRowsPerPage } from "../../hooks/SettingsHooks";
import { useToggle } from "../../hooks/useToggle";
import ElasArrowRightAhead from "../../images/ElasArrowRightAhead.svg";
import {
  checkIfSimulationFinishedDuration,
  mapDispatchToProps,
  projectModes,
  projectStatuses,
} from "../../globals";
import { useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";

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

  [`& .${classes.img}`]: {
    maxWidth: 140,
    marginTop: 8,
    marginBottom: 64,
    marginLeft: 100,
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
  { id: "mode", label: "Mode", width: "15%" },
  { id: "status", label: "Status", width: "15%" },
];

const ProjectTable = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authenticated = useSelector(state => state.authentication);
  const { auth } = useAuth();

  /**
   * Project table state
   */
  const [page, setPage] = React.useState(0);
  const [hoverRowId, setHoverRowId] = React.useState(null);
  const [hoverRowIdPersistent, setHoverRowIdPersistent] = React.useState(null);
  const [hoverRowTitle, setHoverRowTitle] = React.useState(null);
  const [rowsPerPage, handleRowsPerPage] = useRowsPerPage();

  /**
   * Dialog state
   */
  const [onDeleteDialog, toggleDeleteDialog] = useToggle();
  const [onCollaboDialog, toggleCollaboDialog] = useToggle();

  /**
   * Simulation status query state
   */
  const [querySimulationFinished, setQuerySimulationFinished] = React.useState(
    []
  );
  const [querySimulationError, setQuerySimulationError] = React.useState({
    isError: false,
    message: null,
  });

  /**
   * Fetch projects and check if simulation running in the background
   */
  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
    "fetchProjects",
    ProjectAPI.fetchProjects,
    {
      onError: () => {
        setQuerySimulationFinished([]);
      },
      onSuccess: (data) => {
        // reset query for fetching simulation project(s) status
        setQuerySimulationFinished([]);
        // get simulation project(s) running in the background
        const simulationProjects = data.result.filter(
          (element) =>
            element.mode === projectModes.SIMULATION &&
            element.reviews[0] !== undefined &&
            element.reviews[0].status === projectStatuses.REVIEW
        );
        if (!simulationProjects.length) {
          console.log("No simulation running");
        } else {
          const simulationQueries = [];
          const project_id = simulationProjects.map((element) => element.id);
          // prepare query array for fetching simulation project(s) status
          for (let key in project_id) {
            // reset query if error
            if (querySimulationError.isError) {
              queryClient.resetQueries(`fetchProjectStatus-${project_id[key]}`);
              setQuerySimulationError({
                isError: false,
                message: null,
              });
            }
            // update query array
            simulationQueries.push({
              queryKey: [
                `fetchProjectStatus-${project_id[key]}`,
                { project_id: project_id[key] },
              ],
              queryFn: ProjectAPI.fetchProjectStatus,
              enabled: project_id[key] !== null,
              onError: (error) => {
                setQuerySimulationError({
                  isError: true,
                  message: error.message,
                });
              },
              onSuccess: (data) => {
                if (data["status"] === projectStatuses.FINISHED) {
                  // simulation finished
                  queryClient.invalidateQueries("fetchDashboardStats");
                  // update cached data
                  queryClient.setQueryData("fetchProjects", (prev) => {
                    return {
                      ...prev,
                      result: prev.result.map((project) => {
                        return {
                          ...project,
                          reviews: project.reviews.map((review) => {
                            return {
                              ...review,
                              status:
                                project.id === project_id[key]
                                  ? projectStatuses.FINISHED
                                  : review.status,
                            };
                          }),
                        };
                      }),
                    };
                  });
                } else {
                  // not finished yet
                  setTimeout(
                    () =>
                      queryClient.invalidateQueries(
                        `fetchProjectStatus-${project_id[key]}`
                      ),
                    checkIfSimulationFinishedDuration
                  );
                }
              },
              refetchOnWindowFocus: false,
            });
          }
          // pass prepared query array
          setQuerySimulationFinished(simulationQueries);
        }
      },
      refetchOnWindowFocus: false,
    }
  );

  /**
   * Fetch if simulation project(s) finished
   */
  useQueries(querySimulationFinished);

  const { mutate: mutateStatus } = useMutation(ProjectAPI.mutateProjectStatus, {
    onError: (error) => {
      props.setFeedbackBar({
        open: true,
        message: error.message,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries("fetchDashboardStats");
      // update cached data
      queryClient.setQueryData("fetchProjects", (prev) => {
        return {
          ...prev,
          result: prev.result.map((project) => {
            return {
              ...project,
              reviews: project.reviews.map((review) => {
                return {
                  ...review,
                  status:
                    project.id === variables.project_id
                      ? variables.status
                      : review.status,
                };
              }),
            };
          }),
        };
      });
    },
  });

  const handleChangeStatus = (project) => {
    mutateStatus({
      project_id: project["id"],
      status:
        project.reviews[0].status === projectStatuses.REVIEW
          ? projectStatuses.FINISHED
          : projectStatuses.REVIEW,
    });
  };

  const clearSetupError = (project) => {
    mutateStatus({
      project_id: project["id"],
      status: projectStatuses.SETUP,
    });
  };

  const openProject = (project, path) => {
    if (
      project["reviews"][0] === undefined ||
      project["reviews"][0]["status"] === projectStatuses.SETUP ||
      project["reviews"][0]["status"] === projectStatuses.ERROR
    ) {
      // set project id
      props.setProjectId(project["id"]);
      // open project setup dialog
      props.toggleProjectSetup();
      // clear potential setup error
      if (
        project["reviews"][0] !== undefined &&
        project["reviews"][0]["status"] === projectStatuses.ERROR
      ) {
        clearSetupError(project);
      }
    } else if (!project["projectNeedsUpgrade"]) {
      // open project page
      navigate(`/projects/${project["id"]}/${path}`);
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

  /**
   * Show buttons when hovering over project title
   */
  const hoverOnProject = (project_id, project_title) => {
    setHoverRowId(project_id);
    setHoverRowIdPersistent(project_id);
    setHoverRowTitle(project_title);
  };

  const hoverOffProject = () => {
    setHoverRowId(null);
  };

  /**
   * Format date and mode
   */
  const formatDate = (datetime) => {
    let date = new Date(datetime * 1000);
    let dateString = date.toDateString().slice(4);
    let dateDisplay =
      dateString.replace(/\s+\S*$/, ",") + dateString.match(/\s+\S*$/);
    return dateDisplay;
  };

  const formatMode = (mode) => {
    if (mode === "oracle" || !mode) {
      return "Oracle";
    }
    if (mode === "explore") {
      return "Exploration";
    }
    if (mode === "simulate") {
      return "Simulation";
    }
  };

  /**
   * Return status label and style
   */
  const status = (project) => {
    if (
      project.reviews[0] === undefined ||
      project.reviews[0].status === projectStatuses.SETUP ||
      project.reviews[0].status === projectStatuses.ERROR
    ) {
      return [projectStatuses.SETUP, "Setup"];
    }
    if (project.reviews[0].status === projectStatuses.REVIEW) {
      return [projectStatuses.REVIEW, "In Review"];
    }
    if (project.reviews[0].status === projectStatuses.FINISHED) {
      return [projectStatuses.FINISHED, "Finished"];
    }
  };

  const statusStyle = (project) => {
    if (
      project.reviews[0] === undefined ||
      project.reviews[0].status === projectStatuses.SETUP ||
      project.reviews[0].status === projectStatuses.ERROR
    ) {
      return "dashboard-page-table-chip setup";
    }
    if (project.reviews[0].status === projectStatuses.REVIEW) {
      return "dashboard-page-table-chip inreview";
    }
    if (project.reviews[0].status === projectStatuses.FINISHED) {
      return "dashboard-page-table-chip finished";
    }
  };

  /**
   * Table pagination & rows per page setting
   */
  const handlePage = (event, newPage) => {
    setPage(newPage);
  };

  const setRowsPerPage = (event) => {
    handleRowsPerPage(+event.target.value);
    setPage(0);
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

                  const isSimulating = () => {
                    return (
                      row["mode"] === projectModes.SIMULATION &&
                      row["reviews"][0] !== undefined &&
                      row["reviews"][0]["status"] === projectStatuses.REVIEW
                    );
                  };

                  const showAnalyticsButton = () => {
                    return (
                      row["reviews"][0] !== undefined &&
                      !(
                        row["reviews"][0]["status"] === projectStatuses.SETUP ||
                        row["reviews"][0]["status"] === projectStatuses.ERROR
                      )
                    );
                  };

                  const showReviewButton = () => {
                    return (
                      row["reviews"][0] !== undefined &&
                      row["reviews"][0]["status"] === projectStatuses.REVIEW
                    );
                  };

                  const showCollaborationButton = () => {
                    return authenticated && ('owner_id' in row) && row.owner_id === auth.id;
                  };

                  const disableProjectStatusChange = () => {
                    return (
                      row["projectNeedsUpgrade"] ||
                      row["mode"] === projectModes.SIMULATION ||
                      row["reviews"][0] === undefined ||
                      row["reviews"][0]["status"] === projectStatuses.SETUP ||
                      row["reviews"][0]["status"] === projectStatuses.ERROR
                    );
                  };

                  const onClickProjectAnalytics = () => {
                    openProject(row, "");
                  };

                  const onClickProjectReview = () => {
                    openProject(row, "review");
                  };

                  const onClickCollaboration = () => {
                    toggleCollaboDialog();
                  };

                  const onClickProjectExport = () => {
                    if (
                      row["reviews"][0] === undefined ||
                      row["reviews"][0]["status"] === projectStatuses.SETUP ||
                      row["reviews"][0]["status"] === projectStatuses.ERROR
                    ) {
                      queryClient.prefetchQuery(
                        ["fetchExportProject", { project_id: row["id"] }],
                        ProjectAPI.fetchExportProject
                      );
                    } else {
                      openProject(row, "export");
                    }
                  };

                  const onClickProjectDetails = () => {
                    openProject(row, "details");
                  };

                  const updateProjectStatus = () => {
                    handleChangeStatus(row);
                  };
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.id}
                      onMouseEnter={() =>
                        hoverOnProject(row["id"], row["name"])
                      }
                      onMouseLeave={() => hoverOffProject()}
                    >
                      <TableCell sx={{ display: "flex" }}>
                        <Box className={classes.titleWrapper}>
                          <Typography
                            onClick={onClickProjectAnalytics}
                            className={classes.title}
                            variant="subtitle1"
                          >
                            {row["name"]}
                          </Typography>
                          <Box sx={{ flex: 1 }}></Box>
                          {hoverRowId === row.id && (
                            <TableRowButton
                              disableProjectStatusChange={
                                disableProjectStatusChange
                              }
                              isSimulating={isSimulating}
                              showCollaborationButton={showCollaborationButton}
                              showAnalyticsButton={showAnalyticsButton}
                              showReviewButton={showReviewButton}
                              onClickProjectAnalytics={onClickProjectAnalytics}
                              onClickCollaboration={onClickCollaboration}
                              onClickProjectReview={onClickProjectReview}
                              onClickProjectExport={onClickProjectExport}
                              onClickProjectDetails={onClickProjectDetails}
                              projectStatus={status(row)[0]}
                              toggleDeleteDialog={toggleDeleteDialog}
                              updateProjectStatus={updateProjectStatus}
                            />
                          )}
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
                      <TableCell>
                        <Typography
                          className={classes.tableCell}
                          variant="subtitle1"
                          noWrap
                        >
                          {formatMode(row["mode"])}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <Chip
                          size="small"
                          className={statusStyle(row)}
                          label={status(row)[1]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {!isError && isFetching && (
          <Box className={classes.loadingProjects}>
            <CircularProgress />
          </Box>
        )}
        {!isError &&
          !isFetching &&
          isFetched &&
          isSuccess &&
          data.result?.length === 0 && (
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography sx={{ color: "text.secondary", marginTop: "64px" }}>
                Your projects will show up here
              </Typography>
              <Button onClick={props.toggleProjectSetup}>Get Started</Button>
              <img
                src={ElasArrowRightAhead}
                alt="ElasArrowRightAhead"
                className={classes.img}
              />
            </Box>
          )}
        {isError && !isFetching && (
          <Box className={classes.error}>
            <BoxErrorHandler error={error} queryKey="fetchProjects" />
          </Box>
        )}
      </TableContainer>
      {!isError &&
        !isFetching &&
        isFetched &&
        isSuccess &&
        data.result?.length !== 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={data.result?.length}
            rowsPerPage={rowsPerPage}
            labelRowsPerPage="Projects per page:"
            page={page}
            onPageChange={handlePage}
            onRowsPerPageChange={setRowsPerPage}
          />
        )}
      <ProjectCheckDialog
        projectCheck={props.projectCheck}
        setProjectCheck={props.setProjectCheck}
      />
      <ProjectDeleteDialog
        onDeleteDialog={onDeleteDialog}
        toggleDeleteDialog={toggleDeleteDialog}
        projectTitle={hoverRowTitle}
        project_id={hoverRowIdPersistent}
      />
      { authenticated &&
        <InvitationDialog
          mobileScreen={props.mobileScreen}
          openCollaboDialog={onCollaboDialog}
          toggleCollaboDialog={toggleCollaboDialog}
          projectTitle={hoverRowTitle}
          project_id={hoverRowIdPersistent}
        />
      }
      <DialogErrorHandler
        error={querySimulationError}
        isError={querySimulationError.isError}
        queryKey="fetchProjects"
      />
    </StyledPaper>
  );
};

export default connect(null, mapDispatchToProps)(ProjectTable);
