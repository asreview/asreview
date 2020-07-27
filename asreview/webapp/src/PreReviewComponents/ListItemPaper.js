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

import {
  PaperCard,
} from '../PreReviewComponents'

import {
  DialogTitleWithClose,
} from '../Components'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";


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


  const includeAndClose = () => {
    props.includeItem(props.id, ()=>{

      // select the item
      setSelected(true);

      // Close the Dialog
      handleClose();

      props.updatePriorStats();
    });

  }

  const excludeAndClose = () => {
    props.excludeItem(props.id, ()=> {

      // Close the Dialog
      handleClose();

      props.updatePriorStats();
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
        fullWidth={true}
      >
        <DialogTitleWithClose
          title={"Is this article relevant?"}
          onClose={handleClose}
        />
        <DialogContent dividers={true}>
          <PaperCard
            id={props.id}
            title={props.title}
            abstract={props.abstract}
          />
        </DialogContent>
        <DialogActions>

          {/*
          <Button onClick={toggleButton} color="primary">
            {selected ? "Remove from ": "Add to "} prior
          </Button>
          */}

          <Button
            onClick={excludeAndClose}
            color="primary"
          >
            Irrelevant
          </Button>
          <Button
            onClick={includeAndClose}
            color="primary"
          >
            Relevant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )

}

export default ListItemPaper;
