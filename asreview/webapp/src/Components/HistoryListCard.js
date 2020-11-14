import React from 'react';
import {
  Box, 
  Collapse,
  IconButton,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Typography,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles(theme => ({
  iconButton: {
    left: -12,
    color: theme.palette.secondary.main,
  },
}));

const HistoryListCard = (props) => {

  const classes = useStyles();

  const handleClick = (index) => {
    if (props.openIndex === index) {
      props.setOpenIndex("");
    } else {
      props.setOpenIndex(index);
    };
  };

  return (
	<Box>
		<ListItem>
		  {props.index !== props.openIndex &&
		    <ListItemIcon>
		      {props.value.included === 1 ? <FavoriteIcon /> : <CloseIcon />}
		    </ListItemIcon>
		  }
		  {props.index === props.openIndex &&
		    <ListItemIcon>
		      <Tooltip title={props.value.included === 1 ? "Convert to IRRELEVANT" : "Convert to RELEVANT"}>
		        <IconButton 
		          className={classes.iconButton}
		          onClick={() => {props.updateInstance(props.value.id, props.value.included)}}
		        >
		          {props.value.included === 1 ? <CloseIcon /> : <FavoriteIcon />}
		        </IconButton>
		      </Tooltip>
		    </ListItemIcon>
		  }
		  <ListItem
		    button
		    onClick={() => {handleClick(props.index)}}
		  >
		    <ListItemText
		      primary={props.value.title}
		      secondary={props.value.authors}
		    />
		  </ListItem>
		</ListItem>
		<Collapse in={props.index === props.openIndex}>
		  <ListItem>
		    <ListItemText>
		      {(props.value.abstract === "" || props.value.abstract === null || props.value.abstract === "nan") &&
		        <Box fontStyle="italic">
		          <Typography gutterBottom>
		            This document doesn't have an abstract.
		          </Typography>
		        </Box>
		      }
		      {!(props.value.abstract === "" || props.value.abstract === null || props.value.abstract === "nan") &&
		        <Typography>
		          {props.value.abstract}
		        </Typography>
		      }
		    </ListItemText>
		  </ListItem>
		</Collapse>
	</Box>
  );
};

export default HistoryListCard;
