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
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import store from "./redux/store";
import { setProject } from "./redux/actions";
import { setupColor, inReviewColor, finishedColor } from "./globals";

const PREFIX = "ProjectTable";

const classes = {
  root: `${PREFIX}-root`,
  table: `${PREFIX}-table`,
  tableCell: `${PREFIX}-tableCell`,
  chipSetup: `${PREFIX}-chipSetup`,
  chipInReview: `${PREFIX}-chipInReview`,
  chipFinished: `${PREFIX}-chipFinished`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "100%",
    marginBottom: "100px",
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
}));

const columns = [
  { id: "name", label: "Project", width: "55%" },
  { id: "datetimeCreated", label: "Date Created", width: "15%" },
  { id: "mode", label: "Mode", width: "15%" },
  { id: "reviewFinished", label: "Status", width: "15%" },
];

const ProjectTable = (props) => {
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
            {props.projects["projects"]
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                const openExistingProject = () => {
                  console.log("Opening existing project " + row.id);

                  // set the state in the redux store
                  store.dispatch(setProject(row.id));

                  props.handleAppState("project-page");
                };
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell>
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
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </StyledPaper>
  );
};

export default ProjectTable;
