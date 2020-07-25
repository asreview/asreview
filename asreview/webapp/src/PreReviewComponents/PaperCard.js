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

}));

const PaperCard = (props) => {

  const classes = useStyles();

  return (
    <Box>
      <Typography variant="h6">
        {props.title}
      </Typography>
      <Typography>
        {props.abstract}
      </Typography>

    </Box>
  );

}

export default PaperCard;
