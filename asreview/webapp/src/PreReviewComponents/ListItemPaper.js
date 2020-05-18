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

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ListItemPaper = (props) => {

  // dialog open
  const [open, setOpen] = React.useState(false);

  // state of the item
  const [selected, setSelected] = React.useState(props.included === 1);

  /**
   * Open the Dialog with search item
   */
  const handleClickOpen = () => {
    setOpen(true);
  };

  /**
   * Close the Dialog with search item
   */
  const handleClose = () => {
    setOpen(false);
  };


  const toggleButton = () => {

    let label = null;
    if (!selected){
      props.includeItem(props.id)

    } else {
      props.resetItem(props.id)
    }
    setSelected(!selected);
    props.getPriorIncluded();
    handleClose();
  }


  return (
      // {props.removeResultOnRevert && <Collapse in={!selected}>}
    <Box>
      <ListItem
        key={`result-item-${props.id}`}
         button onClick={handleClickOpen}
      >
        <ListItemIcon>
            <FavoriteIcon color={selected ? "secondary": "inherit"}/>
        </ListItemIcon>
        <ListItemText
          primary={props.title}
          secondary={props.authors}
          secondaryTypographyProps={{noWrap:true}}
        />
      </ListItem>

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          {props.title}
        </DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText>
            <Typography noWrap={true}>
              {props.authors}
            </Typography>
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
