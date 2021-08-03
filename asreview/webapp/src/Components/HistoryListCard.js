import React from "react";
import { ListItem, ListItemText, ListItemIcon } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FavoriteIcon from "@material-ui/icons/Favorite";

const useStyles = makeStyles((theme) => ({
  icon: {
    justifyContent: "center",
  },
}));

const HistoryListCard = (props) => {
  const classes = useStyles();

  return (
    <ListItem
      button
      onClick={() => {
        props.handleClick(props.index);
      }}
    >
      <ListItemIcon className={classes.icon}>
        {props.value.included === 1 && <FavoriteIcon />}
      </ListItemIcon>
      <ListItemText primary={props.value.title} />
    </ListItem>
  );
};

export default HistoryListCard;
