import React, { useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import store from "./redux/store";
import { setProject } from "./redux/actions";
import { setupColor, inReviewColor, finishedColor } from "./globals";

const columns = [
  { id: "name", label: "Project", width: "60%", minWidth: 400 },
  { id: "datetimeCreated", label: "Date", width: "20%", minWidth: 100 },
  { id: "reviewFinished", label: "Status", width: "20%", minWidth: 100 },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
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
  },
  chipInReview: {
    color: "white",
    fontWeight: 500,
    backgroundColor: inReviewColor,
  },
  chipFinished: {
    color: "white",
    fontWeight: 500,
    backgroundColor: finishedColor,
  },
}));

const ProjectTable = (props) => {
  
  const classes = useStyles();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const formatDate = (datetime) => {
    let date = new Date(datetime);
    let dateString = date.toDateString().slice(4)
    return dateString
  };

  return (
    <Paper className={classes.root}>
      <TableContainer>
        <Table className={classes.table} stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.projects["projects"].slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              const openExistingProject = () => {
                console.log("Opening existing project " + row.id);

                // set the state in the redux store
                store.dispatch(setProject(row.id));

                props.handleAppState("project-page");
              };
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  <TableCell
                    className={classes.tableCell}
                  >
                    <Box
                      onClick={openExistingProject}
                      style={{ cursor: "pointer" }}
                    >
                      {row["name"]}
                    </Box>
                  </TableCell>
                  <TableCell
                    className={classes.tableCell}
                  >
                    {row["datetimeCreated"] ? formatDate(row["datetimeCreated"]) : "N/A"}
                  </TableCell>
                  <TableCell
                    className={classes.tableCell}
                  >
                    <Chip
                      className={row["projectInitReady"] ? (row["reviewFinished"] ? classes.chipFinished : classes.chipInReview) : classes.chipSetup}
                      label={row["projectInitReady"] ? (row["reviewFinished"] ? "FINISHED" : "IN REVIEW") : "SETUP"}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, props.projects["projects"].length]}
        component="div"
        count={props.projects["projects"].length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  )
};

export default ProjectTable;
