import * as React from "react";
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
import { ProjectCheckDialog, TableRowButton } from "../DashboardComponents";
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
  { id: "created_at_unix", label: "Date", width: "15%" },
  { id: "mode", label: "Mode", width: "15%" },
  { id: "reviewFinished", label: "Status", width: "15%" },
];

const ProjectTable = (props) => {
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
  const [projectCheck, setProjectCheck] = React.useState({
    open: false,
    issue: null,
    destination: "dashboard",
  });

  /**
   * Fetch projects
   */
  const {
    data,
    isFetched,
    isLoading: isLoadingProjects,
    isSuccess: isFetchProjectsSuccess,
  } = useQuery("fetchProjects", ProjectAPI.fetchProjects, {
    refetchOnWindowFocus: false,
  });

  const openProject = (project, page) => {
    // set project id
    props.setProjectId(project["id"]);

    if (!project["projectInitReady"]) {
      // open project setup dialog
      props.handleProjectSetup();
    } else if (!project["projectNeedsUpgrade"]) {
      // open project page
      console.log("Opening project " + project["id"]);
      props.handleAppState("project-page");
      props.handleNavState(page);
    } else {
      // open project check dialog
      setProjectCheck({
        open: true,
        issue: "upgrade",
        destination: page,
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
              isFetchProjectsSuccess &&
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
                    openProject(row, "analytics");
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
        {isLoadingProjects && (
          <Box className={classes.loadingProjects}>
            <CircularProgress />
          </Box>
        )}
        {!isLoadingProjects &&
          isFetched &&
          isFetchProjectsSuccess &&
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
      {!isLoadingProjects &&
        isFetched &&
        isFetchProjectsSuccess &&
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
        handleAppState={props.handleAppState}
        handleNavState={props.handleNavState}
        projectCheck={projectCheck}
        setProjectCheck={setProjectCheck}
      />
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
