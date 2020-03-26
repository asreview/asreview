import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { connect } from "react-redux";

import store from './redux/store'
import { setProject } from './redux/actions'

const useStyles = makeStyles({
  root: {
    maxWidth: "100%",
  },
  media: {
    height: 140,
  },
});

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ProjectCard = (props) => {
  const classes = useStyles();

  const openExistingProject = () => {

    console.log("Opening existing project " + props.id)

    // set the state in the redux store
    store.dispatch(setProject(props.id))

    // change to the review window
    props.setAppState("review")
  }

  return (
    <Card className={classes.root}>
      <CardActionArea>
        {/*<CardMedia
          className={classes.media}
          image="/static/images/cards/contemplative-reptile.jpg"
          title="ASReview Project"
        />*/}
        <CardContent>
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
          color="primary"
          onClick={openExistingProject}
          key={props.id}
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
}

export default connect(mapStateToProps)(ProjectCard);
