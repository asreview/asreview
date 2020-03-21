import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
} from '@material-ui/core';

import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  root: {
    // maxWidth: 345,
    marginTop: 16,
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  close: {
    margin: "8px",
    float: "right",
  },
  button: {
    margin: "8px",
  }
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const PaperCard = (props) => {

  const classes = useStyles();

  const [selected, setSelected] = React.useState(props.included);
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const toggleButton = () => {
    const url = api_url + `project/${props.project_id}/labelitem`;

    var label_new;

    if (!selected){
      label_new = 1;
    } else {
      label_new = props.onNonSelectLabel;
    }

    let body = new FormData();
    body.set('doc_id', props.id);
    body.set('label', label_new);
    body.set('is_prior', 1);

    axios.post(
      url,
      body,
      {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
        }
      })
    .then((result) => {
      setSelected(label_new);
    })
    .catch((error) => {
      console.log(error);
    });

  }

  console.log("Item is visible: " + props.id)


  const item = (
    <Card className={classes.root}>
      {props.removeButton &&
          <IconButton
            edge="end"
            aria-label="Include"
            onClick={toggleButton}
            className={classes.close}
          >
            <CloseIcon />
          </IconButton>
      }
      <CardHeader
        title={props.title}
      />

      {props.collapseAbstract ?
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              {props.abstract}
            </Typography>
          </CardContent>
        </Collapse> 
        :
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {props.abstract}
          </Typography>
        </CardContent>
      }

      <CardActions disableSpacing>
          {props.classify &&
            <div style={{ margin: "0 auto" }}>
              <Button
                variant={selected === 1 ? "outlined" : "contained"}
                color="default"
                className={classes.button}
                startIcon={<FavoriteIcon />}
              >
                Relevant
              </Button>
              <Button
                variant={selected === 0 ? "outlined" : "contained"}
                color="default"
                className={classes.button}
                startIcon={<CloseIcon />}
              >
                Irrelevant
              </Button>
            </div>
          }

          {(props.collapseAbstract && props.abstract !== "") && 
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      </CardActions>
    </Card>
  );

  if(props.removeResultOnRevert){
    return (
      <Collapse
        in={selected === 1}
        mountOnEnter
        unmountOnExit
        appear
        onExited={() => {
          console.log("item removed from DOM");
        }}
        >
      {item}
      </Collapse>
    )    
  } else {
    return <Box>{item}</Box>
  }

}

export default connect(mapStateToProps)(PaperCard);