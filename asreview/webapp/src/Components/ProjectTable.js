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

import { ProjectAPI } from "../api/index.js";
import ElasArrowRightAhead from "../images/ElasArrowRightAhead.png";

import {
  finishedColor,
  inReviewColor,
  mapStateToProps,
  mapDispatchToProps,
  setupColor,
} from "../globals";

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
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "100%",
  },

  [`& .${classes.table}`]: {
    minWidth: 700,
  },

  [`& .${classes.tableCell}`]: {
    letterSpacing: "0.25px",
  },

  [`& .${classes.chipSetup}`]: {
    color: "white",
    backgroundColor: setupColor,
    fontWeight: 500,
    display: "flex",
  },

  [`& .${classes.chipInReview}`]: {
    color: "white",
    fontWeight: 500,
    backgroundColor: inReviewColor,
    display: "flex",
  },

  [`& .${classes.chipFinished}`]: {
    color: "white",
    fontWeight: 500,
    backgroundColor: finishedColor,
    display: "flex",
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
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
        props.handleAppState("dashboard");
      },
      onSuccess: () => {
        props.handleAppState("project-page");
      },
      refetchOnWindowFocus: false,
    }
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const formatDate = (datetime) => {
    let date = new Date(datetime);
    let dateString = date.toDateString().slice(4);
    return dateString;
  };

  return (
    <StyledPaper className={classes.root}>
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
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const openExistingProject = () => {
                    console.log("Opening existing project " + row.id);

                    // set the state in the redux store
                    props.setProjectId(row.id);
                  };
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell>
                        <div className={classes.circularProgress}>
                          {isLoading && row.id === props.project_id && (
                            <CircularProgress
                              size="1rem"
                              thickness={5}
                              sx={{ marginRight: "8px" }}
                            />
                          )}
                          <Box
                            onClick={isLoading ? null : openExistingProject}
                            style={{ cursor: "pointer" }}
                          >
                            <Typography
                              className={classes.tableCell}
                              variant="subtitle1"
                              noWrap
                            >
                              {row["name"]}
                            </Typography>
                          </Box>
                        </div>
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
                          {row["mode"] ? row["mode"] : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <Chip
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
                                ? "FINISHED"
                                : "IN REVIEW"
                              : "SETUP"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {isFetched && data.length === 0 && (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography sx={{ marginTop: "64px" }}>
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
      {isFetched && data.length !== 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          labelRowsPerPage="Projects per page:"
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </StyledPaper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTable);
