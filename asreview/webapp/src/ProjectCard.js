import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import store from "./redux/store";
import { setProject } from "./redux/actions";

const useStyles = makeStyles({
  root: {
    maxWidth: "100%",
  },
  content: {
    height: 120,
  },
  description: {
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
  },
});

const ProjectCard = (props) => {
  const classes = useStyles();

  const openExistingProject = () => {
    console.log("Opening existing project " + props.id);

    // set the state in the redux store
    store.dispatch(setProject(props.id));

    props.handleAppState("project-page");
  };

  return (
    <Card className={classes.root}>
      <CardActionArea onClick={openExistingProject}>
        <CardContent className={classes.content}>
          <Typography gutterBottom variant="h5" component="h2">
            {props.name}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            className={classes.description}
          >
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProjectCard;
