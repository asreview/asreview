import React, { useState } from "react";
import { useQuery } from "react-query";
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

import { TableRowButton } from "../DashboardComponents";
import { ProjectAPI } from "../../api/index.js";
import { useRowsPerPage } from "../../hooks/SettingsHooks";
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
  circularProgress: `${PREFIX}-circularProgress`,
  noProject: `${PREFIX}-noProject`,
  img: `${PREFIX}-img`,
  title: `${PREFIX}-title`,
  titleWrapper: `${PREFIX}-title-wrapper`,
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

  [`& .${classes.circularProgress}`]: {
    display: "flex",
    alignItems: "center",
  },

  [`&. ${classes.noProject}`]: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    "& > *": {
      margin: theme.spacing(1),
    },
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
}));

const columns = [
  { id: "name", label: "Project", width: "55%" },
  { id: "datetimeCreated", label: "Date", width: "15%" },
  { id: "mode", label: "Mode", width: "15%" },
  { id: "reviewFinished", label: "Status", width: "15%" },
];

const ProjectTable = (props) => {
  const [page, setPage] = useState(0);
  const [hoverRowId, setHoverRowId] = useState(null);
  const [rowsPerPage, handleRowsPerPage] = useRowsPerPage();

  /**
   * Fetch projects
   */
  const { data, isFetched } = useQuery(
    "fetchProjects",
    ProjectAPI.fetchProjects,
    { refetchOnWindowFocus: false }
  );

  /**
   * When open a project, convert if old
   */
  const { isLoading } = useQuery(
    ["fetchConvertProjectIfOld", { project_id: props.project_id }],
    ProjectAPI.fetchConvertProjectIfOld,
    {
      enabled: props.project_id !== null && !props.onCreateProject,
      onError: () => {
        props.handleAppState("home");
      },
      onSuccess: () => {
        props.handleAppState("project-page");
      },
      refetchOnWindowFocus: false,
    }
  );

  /**
   * Show buttons when hovering over project title
   */
  const hoverOnProject = (project_id) => {
    setHoverRowId(project_id);
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

  const formMode = (mode) => {
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
            {isFetched &&
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
                    props.handleNavState("analytics");
                  };

                  const onClickProjectReview = () => {
                    console.log("Opening existing project " + row.id);
                    props.setProjectId(row.id);
                    props.handleNavState("review");
                  };
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.id}
                      onMouseEnter={() => hoverOnProject(row.id)}
                      onMouseLeave={() => hoverOffProject()}
                    >
                      <TableCell sx={{ display: "flex" }}>
                        <Box className={classes.circularProgress}>
                          {isLoading && row.id === props.project_id && (
                            <CircularProgress
                              size="1rem"
                              thickness={5}
                              sx={{ marginRight: "8px" }}
                            />
                          )}
                        </Box>
                        <Box className={classes.titleWrapper}>
                          <Typography
                            onClick={isLoading ? null : onClickProjectAnalytics}
                            className={classes.title}
                            variant="subtitle1"
                          >
                            {row["name"]}
                          </Typography>
                          <Box sx={{ flex: 1 }}></Box>
                          {hoverRowId === row.id && (
                            <TableRowButton
                              isConverting={isLoading}
                              showAnalyticsButton={showAnalyticsButton}
                              showReviewButton={showReviewButton}
                              onClickProjectAnalytics={onClickProjectAnalytics}
                              onClickProjectReview={onClickProjectReview}
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
                          {row["mode"] ? formMode(row["mode"]) : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <Chip
                          size="small"
                          className={
                            row["projectInitReady"]
                              ? row["reviewFinished"]
                                ? classes.chipFinished
                                : classes.chipInReview
                              : classes.chipSetup
                          }
                          label={
                            row["projectInitReady"]
                              ? row["reviewFinished"]
                                ? "Finished"
                                : "In Review"
                              : "Setup"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {isFetched && data?.length === 0 && (
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
      {isFetched && data?.length !== 0 && (
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
    </StyledPaper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTable);
