import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { ProjectAPI } from "./api/index.js";

const PREFIX = "PublicationZone";

const classes = {
  header: `${PREFIX}-header`,
  title: `${PREFIX}-title`,
  continuButton: `${PREFIX}-continuButton`,
  wrapper: `${PREFIX}-wrapper`,
  buttonProgress: `${PREFIX}-buttonProgress`,
  mediumDangerZone: `${PREFIX}-mediumDangerZone`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.header}`]: {
    paddingTop: "128px",
    paddingBottom: "84px",
    textAlign: "center",
  },

  [`& .${classes.title}`]: {
    color: "orange",
    margin: "32px 12px 12px 12px",
  },

  [`& .${classes.continuButton}`]: {
    marginTop: "24px",
  },

  [`& .${classes.wrapper}`]: {
    margin: theme.spacing(1),
    position: "relative",
  },

  [`& .${classes.buttonProgress}`]: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: 0,
    marginLeft: -12,
  },

  [`& .${classes.mediumDangerZone}`]: {
    // borderColor: "orange",
    // borderWidth: "2px",
    // borderStyle: "solid",
    // boxShadow: "none",
  },
}));

const PublicationZone = (props) => {
  /*
  Download the project file
  */
  const downloadProject = () => {
    ProjectAPI.export_project(props.project_id);
  };

  return (
    <StyledBox>
      <Typography variant="h6" className={classes.title}>
        Publication and export
      </Typography>

      <Paper className={classes.mediumDangerZone}>
        <List className={classes.root}>
          <ListItem
            button
            onClick={props.toggleExportResult}
            alignItems="flex-start"
            disabled={!props.showExportResult}
            key="download-result"
          >
            <ListItemText
              primary="Download results"
              secondary={
                "Download a file with all decisions. Various download formats are available."
              }
            />
          </ListItem>
          <Divider component="li" />
          <ListItem
            button
            onClick={downloadProject}
            alignItems="flex-start"
            key="download-project"
          >
            <ListItemText
              primary="Export this project"
              secondary={
                "Download a complete copy of this project. Ideal to share or import later on."
              }
            />
          </ListItem>
          <Divider component="li" />
          <ListItem
            button
            onClick={props.finishProject}
            alignItems="flex-start"
            disabled={!props.showExportResult}
            key="finish-project"
          >
            <ListItemText
              primary={
                props.reviewFinished
                  ? "Mark screening as finished (undo)"
                  : "Mark screening as finished"
              }
              secondary={
                props.reviewFinished
                  ? "Mark the screening process as ongoing and resume reviewing."
                  : "Stop reviewing and mark the screening process as finished."
              }
            />
          </ListItem>
        </List>
      </Paper>
    </StyledBox>
  );
};

export default PublicationZone;
