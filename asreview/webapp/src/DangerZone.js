import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import ProjectSettings from "./ProjectSettings.js";

const PREFIX = "DangerZone";

const classes = {
  title: `${PREFIX}-title`,
  wrapper: `${PREFIX}-wrapper`,
  dangerZone: `${PREFIX}-dangerZone`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.title}`]: {
    color: "red",
    margin: "32px 12px 12px 12px",
  },

  [`& .${classes.wrapper}`]: {
    margin: theme.spacing(1),
    position: "relative",
  },

  [`& .${classes.dangerZone}`]: {
    color: "red",
  },
}));

const DangerZone = (props) => {
  const [settings, setDelete] = React.useState(false);

  const toggleProjectDelete = () => {
    setDelete((a) => !a);
  };

  return (
    <StyledBox>
      <Typography variant="h6" className={classes.title}>
        Danger Zone
      </Typography>

      <Paper className={classes.dangerZone}>
        <List className={classes.root}>
          {/*
          <ListItem alignItems="flex-start">
            <ListItemText
              primary="Archive this project"
              secondary={'Mark this project as archived and read-only.'}
            />
          </ListItem>
          <Divider component="li" />
          */}
          <ListItem
            button
            onClick={toggleProjectDelete}
            alignItems="flex-start"
          >
            <ListItemText
              primary="Delete this project"
              secondary={
                "Once you delete a project, there is no going back. Please be certain."
              }
            />
          </ListItem>
        </List>
        <ProjectSettings
          id={props.project_id}
          settings={settings}
          toggleProjectDelete={toggleProjectDelete}
          handleAppState={props.handleAppState}
        />
      </Paper>
    </StyledBox>
  );
};

export default DangerZone;
