import React from 'react'
import {

  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@material-ui/core'
import FavoriteIcon from '@material-ui/icons/Favorite'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

/* Hook for the Help button

*/
export const useHelp = () => {

  const [help, setHelp] = React.useState(false);

  const openHelp = () => {
    setHelp(true)
  }

  const closeHelp = () => {
    setHelp(false)
  }

  return [help, openHelp, closeHelp];

}


const Help = (props) => {

  return (

    <Dialog
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle>
        Help: {props.title}
      </DialogTitle>
      <DialogContent dividers={true}>
        {props.message}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )

}

export default Help;
