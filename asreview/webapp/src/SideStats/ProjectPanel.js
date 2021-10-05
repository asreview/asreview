import React from "react";
import { ListSubheader, ListItem } from "@mui/material";

const ProjectPanel = (props) => {
  return (
    <div>
      <ListSubheader component="div" id="list-subheader-project">
        Project
      </ListSubheader>
      <ListItem key="project-name">{props.name}</ListItem>
      <ListItem key="project-authors">
        <i>{props.authors ? props.authors : "Unknown authors"}</i>
      </ListItem>
    </div>
  );
};

export default ProjectPanel;
