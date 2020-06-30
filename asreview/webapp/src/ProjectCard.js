import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import store from './redux/store'
import { setProject } from './redux/actions'

import ProjectSettings from './ProjectSettings.js'

const useStyles = makeStyles({
  root: {
    maxWidth: "100%",
  },
  content: {
    height: 120,
  },
});

const ProjectCard = (props) => {
  const classes = useStyles();

  const [settings, setSettings] = React.useState(false);

  const openExistingProject = () => {

    console.log("Opening existing project " + props.id)

    // set the state in the redux store
    store.dispatch(setProject(props.id))

    // change to the review window
    props.handleAppState("review")
  }

  const toggleProjectSettings = () => {
    console.log("Open settings project " + props.id)
    setSettings(a => (!a));
  };

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
          <Typography gutterBottom variant="h5" component="h2">
            {props.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
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
        <Button
          size="small"
          onClick={toggleProjectSettings}
        >
          Settings
        </Button>
      </CardActions>
      <ProjectSettings
        id={props.id}
        settings={settings}
        toggleProjectSettings={toggleProjectSettings}
        refreshProjects={props.refreshProjects}
      />
    </Card>
  );
}

export default ProjectCard;
