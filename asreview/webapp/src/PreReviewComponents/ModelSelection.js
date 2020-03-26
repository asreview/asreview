import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container';
import {
  Typography,
} from '@material-ui/core'
import { useState, useEffect } from 'react';

const useStyles = makeStyles({

});

const ModelSelection = (props) => {
  const classes = useStyles();

  return (
    <p>Make selections to the model</p>
  )
}

export default ModelSelection;