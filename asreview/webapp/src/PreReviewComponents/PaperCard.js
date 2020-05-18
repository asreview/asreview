import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Typography,
} from '@material-ui/core';

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

  // included label for card
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

    return (
      <Card
        className={classes.root}
        key={props.id}
      >
        <CardHeader
          title={props.title}
        />

        {props.collapseAbstract ?
          <Collapse
            in={expanded}
            timeout="auto"
          >
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

          {/* Show the classification buttons if and only if classify is true */}
            {props.classify &&
              <div style={{ margin: "0 auto" }}>
                <Button
                  variant="contained"
                  color="default"
                  className={classes.button}
                  startIcon={<FavoriteIcon />}
                  onClick={() => props.includeItem(props.id)}
                >
                  Relevant
                </Button>
                <Button
                  variant="contained"
                  color="default"
                  className={classes.button}
                  startIcon={<CloseIcon />}
                  onClick={() => props.excludeItem(props.id)}
                >
                  Irrelevant
                </Button>
              </div>
            }

          {/* Show the expansion panel if and only if there is abstract */}
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

}

export default connect(mapStateToProps)(PaperCard);
