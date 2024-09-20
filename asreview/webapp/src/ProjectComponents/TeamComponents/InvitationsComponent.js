import * as React from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { formatDate } from "globals.js";

const PREFIX = "InvitationsComponent";

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
    width: "90%",
    borderRadius: 16,
    marginBottom: 64,
    marginTop: 16,
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: 10,
    paddingRight: 10,
  },
  [`& .${classes.error}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 132,
  },
  [`& .${classes.table}`]: {
    width: "100%",
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
  { id: "name", label: "Project", width: "45%" },
  { id: "created_at_unix", label: "Date", width: "15%" },
  { id: "mode", label: "Mode", width: "15%" },
  { id: "action", label: "Action", width: "25%" },
];

const InvitationsComponent = (props) => {
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
            {props.projectInvitations.map((project) => {
              return (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{formatDate(project.created_at_unix)}</TableCell>
                  <TableCell>{project.mode}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => props.handleAcceptance(project)}
                      sx={{ textTransform: "none" }}
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => props.handleRejection(project)}
                      sx={{ textTransform: "none" }}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledPaper>
  );
};

export default InvitationsComponent;
