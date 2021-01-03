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

  // click to fold/unfold abstract and decision button
  const handleClick = (index) => {
    if (props.state["select"] === 1) {
      props.setOpenIndex({
        "index": index,
        "record": props.state["data"][index],
      });
    } else if (props.state["select"] === 2) {
      props.setOpenIndex({
        "index": index,
        "record": props.state["data"].filter(value => value.included === 1)[index],
      });
    } else {
      props.setOpenIndex({
        "index": index,
        "record": props.state["data"].filter(value => value.included !== 1)[index],
      });
    }
  };


  return (
	<Box>
		<ListItem
		  button
		  onClick={() => {handleClick(props.index)}}
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
