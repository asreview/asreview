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
} from '@material-ui/core'
import FavoriteIcon from '@material-ui/icons/Favorite'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ListItemPaper = (props) => {

  const [selected, setSelected] = React.useState(props.included === 1);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleButton = () => {

    const url = api_url + `project/${props.project_id}/labelitem`;

    let body = new FormData();
    body.set('doc_id', props.id);
    if (!selected){
      body.set('label', 1);
      console.log(`${props.project_id} - add item ${props.id} to prior inclusions`);
    } else {
      body.set('label', -1);
      console.log(`${props.project_id} - remove item ${props.id} from prior knowledge`);
    }
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
      setSelected(!selected);
      handleClose();
    })
    .catch((error) => {
      console.log(error);
    });

  }


  return (
      // {props.removeResultOnRevert && <Collapse in={!selected}>}
    <Box>
      <ListItem
        key={`result-item-${props.id}`}
         button onClick={handleClickOpen}
      >
        <ListItemIcon>
            <FavoriteIcon color={selected ? "secondary": "default"}/>
        </ListItemIcon>
        <ListItemText
          primary={props.title}
          secondary={props.authors}
        />
      </ListItem>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle>
          {props.title}
        </DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText>
            {props.authors}
          </DialogContentText>
          <DialogContentText>
            {props.abstract}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleButton} color="primary">
            {selected ? "Remove from ": "Add to "} prior
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )

}

export default connect(mapStateToProps)(ListItemPaper);
