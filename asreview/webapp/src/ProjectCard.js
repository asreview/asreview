import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import store from './redux/store'
import { setProject } from './redux/actions'
import { projectModes } from './globals.js';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: "100%",
  },
  content: {
    height: 140,
  },
  modeSimulation: {
    marginBottom: 4,
    backgroundColor: theme.palette.warning.light
  },
  modeOracle: {
    marginBottom: 4,
    backgroundColor: theme.palette.grey.light,
  },
  description: {
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
  }
}));

const ProjectCard = (props) => {
  const classes = useStyles();

  const openExistingProject = () => {

    console.log("Opening existing project " + props.id)

    // set the state in the redux store
    store.dispatch(setProject(props.id))

    props.handleAppState("project-page")

  }

  return (
    <Card className={classes.root}>
      <CardActionArea>
        {/*<CardMedia
          className={classes.media}
          image="/static/images/cards/contemplative-reptile.jpg"
          title="ASReview Project"
        />*/}
        <CardContent
          className={classes.content}
        >
          {props.mode && props.mode === projectModes.ORACLE && (
            <Chip
              size="small"
              label={props.mode}
              className={classes.modeOracle}
              />
          )}

          {props.mode && props.mode === projectModes.SIMULATION && (
            <Chip
              size="small"
              label={props.mode}
              className={classes.modeSimulation}
              />
          )}

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
      <CardActions>
        <Button
          size="small"
          onClick={openExistingProject}
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProjectCard;
