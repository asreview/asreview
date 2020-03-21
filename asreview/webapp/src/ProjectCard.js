import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { connect } from "react-redux";

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

  console.log("project" + props.project_id)

  const openExistingProject = () => {
    // set the state in the redux store

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
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
}

export default connect(mapStateToProps)(ProjectCard);
