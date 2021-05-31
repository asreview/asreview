import React from "react";
import {
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

const columns = [
  { id: "name", label: "Project", minWidth: 170 },
  { id: "reviewFinished", label: "Status", minWidth: 170 },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  table: {
    minWidth: 700,
  },
}));

const ProjectTable = (props) => {
  
  const classes = useStyles();

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
                <TableCell onClick={openExistingProject}>
                  {row["name"]}
                </TableCell>
                <TableCell>
                  <Chip
                    label={row["projectInitReady"] ? (row["reviewFinished"] ? "Finished" : "In Review") : "Setup"}
                    color={row["projectInitReady"] ? (row["reviewFinished"] ? "#415f38" : "#f39200") : "#706f6f"}
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
