import React from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import store from "./redux/store";
import { setProject } from "./redux/actions";
import { setupColor, inReviewColor, finishedColor } from "./globals";

const columns = [
  { id: "name", label: "Project", minWidth: 170 },
  { id: "datetimeCreated", label: "Date", minWidth: 100 },
  { id: "reviewFinished", label: "Status", minWidth: 100 },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
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

  const formatDate = (datetime) => {
    let date = new Date(datetime);
    let dateString = date.toDateString().slice(4)
    return dateString
  };

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                style={{ minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.projects["projects"].map((row) => {
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
  )
};

export default ProjectTable;
