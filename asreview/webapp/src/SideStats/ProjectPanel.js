import React from "react";
import { ListSubheader, ListItem } from "@material-ui/core";
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles(theme => ({
//   root: {
//     width: '100%',
//   },
//   heading: {
//     fontSize: theme.typography.pxToRem(15),
//     fontWeight: theme.typography.fontWeightRegular,
//   },
// }));

const ProjectPanel = (props) => {
  // const classes = useStyles();

  return (
    <div>
      <ListSubheader component="div" id="list-subheader-project">
        Project
      </ListSubheader>
      <ListItem key="project-name">{props.name}</ListItem>
      <ListItem key="project-authors">{props.authors}</ListItem>
    </div>
  );
};

export default ProjectPanel;
