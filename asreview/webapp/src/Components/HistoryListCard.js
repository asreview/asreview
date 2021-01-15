import React from 'react';
import {
  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloseIcon from '@material-ui/icons/Close';


const HistoryListCard = (props) => {


  return (
	<Box>
		<ListItem
		  button
		  onClick={() => {props.handleClick(props.index)}}
		>
		  <ListItemIcon>
		    {props.value.included === 1 ? <FavoriteIcon color="secondary" /> : <CloseIcon />}
		  </ListItemIcon>
		  <ListItemText
		    primary={props.value.title}
		  />
		</ListItem>
	</Box>
  );
};

export default HistoryListCard;
