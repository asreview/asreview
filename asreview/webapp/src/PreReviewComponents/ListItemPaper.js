import React from 'react'
import {
  Box,
  ListItem,
  ListItemText,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

import {
  PaperCard,
} from '../PreReviewComponents'

import {
  DialogTitleWithClose,
} from '../Components'


const ListItemPaper = (props) => {

  // dialog open
  const [open, setOpen] = React.useState(false);

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

      // Close the Dialog
      handleClose();

      // Close the search results
      props.closeSearchResult()

      props.updatePriorStats();
    });

  }

  const excludeAndClose = () => {
    props.excludeItem(props.id, ()=> {

      // Close the Dialog
      handleClose();

      // Close the search results
      props.closeSearchResult()

      props.updatePriorStats();
    });

  }

  return (
    <Box>
      <ListItem
        key={`result-item-${props.id}`}
         button onClick={handleClickOpen}
      >
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
