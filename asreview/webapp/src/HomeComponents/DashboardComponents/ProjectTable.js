import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
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

import { ProjectDeleteDialog } from "../../Components";
import { TableRowButton } from "../DashboardComponents";
import { ProjectAPI } from "../../api/index.js";
import { useRowsPerPage } from "../../hooks/SettingsHooks";
import { useToggle } from "../../hooks/useToggle";
import ElasArrowRightAhead from "../../images/ElasArrowRightAhead.png";

import { mapStateToProps, mapDispatchToProps } from "../../globals";

const PREFIX = "ProjectTable";

const classes = {
  root: `${PREFIX}-root`,
  table: `${PREFIX}-table`,
  tableCell: `${PREFIX}-tableCell`,
  chipSetup: `${PREFIX}-chipSetup`,
  chipInReview: `${PREFIX}-chipInReview`,
  chipFinished: `${PREFIX}-chipFinished`,
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

  [`& .${classes.table}`]: {
    minWidth: 700,
  },

  [`& .${classes.tableCell}`]: {
    letterSpacing: "0.25px",
  },

  [`& .${classes.chipSetup}`]: {
    color: "#424242",
    backgroundColor: "#bdbdbd",
    fontWeight: 500,
  },

  [`& .${classes.chipInReview}`]: {
    color: "#91620B",
    backgroundColor: "#FFFBE7",
    fontWeight: 500,
  },

  [`& .${classes.chipFinished}`]: {
    color: "rgb(0, 123, 85)",
    backgroundColor: "#E1FAE3",
    fontWeight: 500,
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
  { id: "datetimeCreated", label: "Date", width: "15%" },
  { id: "mode", label: "Mode", width: "15%" },
  { id: "reviewFinished", label: "Status", width: "15%" },
];

const ProjectTable = (props) => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [hoverRowId, setHoverRowId] = useState(null);
  const [hoverRowIdPersistent, setHoverRowIdPersistent] = useState(null);
  const [hoverRowTitle, setHoverRowTitle] = useState(null);
  const [onProject, setOnProject] = useState(false);
  const [rowsPerPage, handleRowsPerPage] = useRowsPerPage();
  const [onDeleteDialog, toggleDeleteDialog] = useToggle();

  /**
   * Fetch projects
   */
  const {
    data,
    isFetched,
    isLoading: isLoadingProjects,
    isSuccess,
  } = useQuery("fetchProjects", ProjectAPI.fetchProjects, {
    refetchOnWindowFocus: false,
  });

  /**
   * When open a project, convert if old
   */
  const { isLoading: isConverting } = useQuery(
    ["fetchConvertProjectIfOld", { project_id: props.project_id }],
    ProjectAPI.fetchConvertProjectIfOld,
    {
      enabled: onProject && props.project_id !== null,
      onError: () => {
        props.handleAppState("home");
      },
      onSuccess: () => {
        props.handleAppState("project-page");
      },
      onSettled: () => setOnProject(false),
      refetchOnWindowFocus: false,
    }
  );

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
    let date = new Date(datetime);
    let dateString = date.toDateString().slice(4);
    let dateDisplay =
      dateString.replace(/\s+\S*$/, ",") + dateString.match(/\s+\S*$/);
    return dateDisplay;
  };

  const formatMode = (mode) => {
    if (mode === "oracle") {
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
  const statusLabel = (row) => {
    if (row["projectInitReady"]) {
      if (row["reviewFinished"]) {
        return "Finished";
      } else {
        return "In Review";
      }
    } else {
      return "Setup";
    }
  };

  const statusStyle = (row) => {
    if (row["projectInitReady"]) {
      if (row["reviewFinished"]) {
        return classes.chipFinished;
      } else {
        return classes.chipInReview;
      }
    } else {
      return classes.chipSetup;
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
            {!isLoadingProjects &&
              isFetched &&
              isSuccess &&
              data
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const showAnalyticsButton = () => {
                    return row["projectInitReady"];
                  };

                  const showReviewButton = () => {
                    return row["projectInitReady"] && !row["reviewFinished"];
                  };

                  const onClickProjectAnalytics = () => {
                    console.log("Opening existing project " + row.id);
                    props.setProjectId(row.id);
                    if (!row["projectInitReady"]) {
                      // when project is in setup
                      props.handleProjectSetup();
                    } else {
                      setOnProject(true);
                      props.handleNavState("analytics");
                    }
                  };

                  const onClickProjectReview = () => {
                    console.log("Opening existing project " + row.id);
                    setOnProject(true);
                    props.setProjectId(row.id);
                    props.handleNavState("review");
                  };

                  const onClickProjectExport = () => {
                    if (!row["projectInitReady"]) {
                      queryClient.prefetchQuery(
                        ["fetchExportProject", { project_id: row.id }],
                        ProjectAPI.fetchExportProject
                      );
                    } else {
                      console.log("Opening existing project " + row.id);
                      setOnProject(true);
                      props.setProjectId(row.id);
                      props.handleNavState("export");
                    }
                  };

                  const onClickProjectDetails = () => {
                    console.log("Opening existing project " + row.id);
                    props.setProjectId(row.id);
                    if (!row["projectInitReady"]) {
                      // when project is in setup
                      props.handleProjectSetup();
                    } else {
                      setOnProject(true);
                      props.handleNavState("details");
                    }
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
                        <Box className={classes.converting}>
                          {isConverting && row.id === props.project_id && (
                            <CircularProgress
                              size="1rem"
                              thickness={5}
                              sx={{ marginRight: "8px" }}
                            />
                          )}
                        </Box>
                        <Box className={classes.titleWrapper}>
                          <Typography
                            onClick={
                              isConverting ? null : onClickProjectAnalytics
                            }
                            className={classes.title}
                            variant="subtitle1"
                          >
                            {row["name"]}
                          </Typography>
                          <Box sx={{ flex: 1 }}></Box>
                          {hoverRowId === row.id && (
                            <TableRowButton
                              isConverting={isConverting}
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
                          {row["datetimeCreated"]
                            ? formatDate(row["datetimeCreated"])
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          className={classes.tableCell}
                          variant="subtitle1"
                          noWrap
                        >
                          {row["mode"] ? formatMode(row["mode"]) : "N/A"}
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
        {isLoadingProjects && (
          <Box className={classes.loadingProjects}>
            <CircularProgress />
          </Box>
        )}
        {!isLoadingProjects && isFetched && isSuccess && data?.length === 0 && (
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
            <Button
              onClick={(event) => {
                props.handleClickAdd(event, "newProject");
              }}
            >
              Get Started
            </Button>
            <img
              src={ElasArrowRightAhead}
              alt="ElasArrowRightAhead"
              className={classes.img}
            />
          </Box>
        )}
      </TableContainer>
      {!isLoadingProjects && isFetched && isSuccess && data?.length !== 0 && (
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
      <ProjectDeleteDialog
        onDeleteDialog={onDeleteDialog}
        toggleDeleteDialog={toggleDeleteDialog}
        projectTitle={hoverRowTitle}
        project_id={hoverRowIdPersistent}
      />
    </StyledPaper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTable);
