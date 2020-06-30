import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Box,
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
  }
}));

const PaperCard = (props) => {

  const classes = useStyles();

  console.log("test")

  return (
    <Box>
      <Typography variant="title">
        {props.title}
      </Typography>
      <Typography>
        {props.abstract}
      </Typography>

    </Box>
  );

}

export default PaperCard;
