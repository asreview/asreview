import * as React from "react";
import { useQuery, useQueries, useQueryClient } from "react-query";
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
import { ProjectAPI } from "../../api/index.js";
import { useRowsPerPage } from "../../hooks/SettingsHooks";
import { useToggle } from "../../hooks/useToggle";
import ElasArrowRightAhead from "../../images/ElasArrowRightAhead.png";

import { mapDispatchToProps, projectModes } from "../../globals";

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
  { id: "reviewFinished", label: "Status", width: "15%" },
];

const ProjectTable = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
        const simulationProjects = data.filter(
          (element) =>
            element.mode === projectModes.SIMULATION &&
            element.projectInitReady &&
            !element.reviewFinished
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
              queryClient.resetQueries(
                `fetchSimulationFinished-${project_id[key]}`
              );
              setQuerySimulationError({
                isError: false,
                message: null,
              });
            }
            // update query array
            simulationQueries.push({
              queryKey: [
                `fetchSimulationFinished-${project_id[key]}`,
                { project_id: project_id[key] },
              ],
              queryFn: ProjectAPI.fetchSimulationFinished,
              enabled: project_id[key] !== null,
              onError: (error) => {
                setQuerySimulationError({
                  isError: true,
                  message: error.message,
                });
              },
              onSuccess: (data) => {
                if (data["status"] === 1) {
                  // simulation finished
                  queryClient.invalidateQueries("fetchDashboardStats");
                  queryClient.invalidateQueries("fetchProjects");
                } else {
                  // not finished yet
                  setTimeout(
                    () =>
                      queryClient.invalidateQueries(
                        `fetchSimulationFinished-${project_id[key]}`
                      ),
                    6000
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

  const openProject = (project, path) => {
    if (!project["projectInitReady"]) {
      // set project id
      props.setProjectId(project["id"]);
      // open project setup dialog
      props.toggleProjectSetup();
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
  const statusLabel = (project) => {
    if (project["projectInitReady"]) {
      if (project["reviewFinished"]) {
        return "Finished";
      } else {
        return "In Review";
      }
    } else {
      return "Setup";
    }
  };

  const statusStyle = (project) => {
    if (project["projectInitReady"]) {
      if (project["reviewFinished"]) {
        return "dashboard-page-table-chip finished";
      } else {
        return "dashboard-page-table-chip inreview";
      }
    } else {
      return "dashboard-page-table-chip setup";
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
              data
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const isSimulating = () => {
                    return (
                      row["mode"] === projectModes.SIMULATION &&
                      row["projectInitReady"] &&
                      !row["reviewFinished"]
                    );
                  };

                  const showAnalyticsButton = () => {
                    return row["projectInitReady"];
                  };

                  const showReviewButton = () => {
                    return row["projectInitReady"] && !row["reviewFinished"];
                  };

                  const onClickProjectAnalytics = () => {
                    openProject(row, "");
                  };

                  const onClickProjectReview = () => {
                    openProject(row, "review");
                  };

                  const onClickProjectExport = () => {
                    if (
                      !row["projectInitReady"] ||
                      row["projectNeedsUpgrade"]
                    ) {
                      queryClient.prefetchQuery(
                        ["fetchExportProject", { project_id: row.id }],
                        ProjectAPI.fetchExportProject
                      );
                    } else {
                      openProject(row, "export");
                    }
                  };

                  const onClickProjectDetails = () => {
                    openProject(row, "details");
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
                              isSimulating={isSimulating}
                              showAnalyticsButton={showAnalyticsButton}
                              showReviewButton={showReviewButton}
                              onClickProjectAnalytics={onClickProjectAnalytics}
                              onClickProjectReview={onClickProjectReview}
                              onClickProjectExport={onClickProjectExport}
                              onClickProjectDetails={onClickProjectDetails}
                              toggleDeleteDialog={toggleDeleteDialog}
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
                          label={statusLabel(row)}
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
          data?.length === 0 && (
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
        data?.length !== 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={data?.length}
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
      <DialogErrorHandler
        error={querySimulationError}
        isError={querySimulationError.isError}
        queryKey="fetchProjects"
      />
    </StyledPaper>
  );
};

export default connect(null, mapDispatchToProps)(ProjectTable);
