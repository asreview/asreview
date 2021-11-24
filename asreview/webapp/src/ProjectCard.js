import React from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import store from "./redux/store";
import { setProject } from "./redux/actions";

const PREFIX = "ProjectCard";

const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  description: `${PREFIX}-description`,
};

const StyledCard = styled(Card)({
  [`&.${classes.root}`]: {
    maxWidth: "100%",
  },
  [`& .${classes.content}`]: {
    height: 120,
  },
  [`& .${classes.description}`]: {
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
  },
});

const ProjectCard = (props) => {
  const openExistingProject = () => {
    console.log("Opening existing project " + props.id);

    // set the state in the redux store
    store.dispatch(setProject(props.id));

    props.handleAppState("project-page");
  };

  return (
    <StyledCard className={classes.root}>
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
    </StyledCard>
  );
};

export default ProjectCard;
