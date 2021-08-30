import React, { useState } from "react";
import { useQuery } from "react-query";
import { connect } from "react-redux";
import {
  Box,
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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { ProjectAPI } from "./api/index.js";
import {
  finishedColor,
  inReviewColor,
  mapStateToProps,
  mapDispatchToProps,
  setupColor,
} from "./globals";

const columns = [
  { id: "name", label: "Project", width: "55%" },
  { id: "datetimeCreated", label: "Date Created", width: "15%" },
  { id: "mode", label: "Mode", width: "15%" },
  { id: "reviewFinished", label: "Status", width: "15%" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginBottom: "100px",
  },
  table: {
    minWidth: 700,
  },
  tableCell: {
    letterSpacing: "0.25px",
  },
  chipSetup: {
    color: "white",
    backgroundColor: setupColor,
    fontWeight: 500,
    display: "flex",
  },
  chipInReview: {
    color: "white",
    fontWeight: 500,
    backgroundColor: inReviewColor,
    display: "flex",
  },
  chipFinished: {
    color: "white",
    fontWeight: 500,
    backgroundColor: finishedColor,
    display: "flex",
  },
  circularProgress: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(1),
    },
    alignItems: "center",
  },
}));

const ProjectTable = (props) => {
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // convert old project
  const { isLoading } = useQuery(
    ["fetchConvertProjectIfOld", { project_id: props.project_id }],
    ProjectAPI.fetchConvertProjectIfOld,
    {
      enabled: props.project_id !== null,
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
    <Paper className={classes.root}>
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
            {props.projects["projects"]
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
                          <CircularProgress size="1rem" thickness={5} />
                        )}
                        <Box
                          onClick={openExistingProject}
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
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={props.projects["projects"].length}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage="Projects per page:"
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTable);
