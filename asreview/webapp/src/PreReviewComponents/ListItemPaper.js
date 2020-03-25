import React from 'react'
import {
  Box,
  Collapse,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
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

  console.log("Included label: " + props.included);

  const toggleButton = () => {

    const url = api_url + `project/${props.project_id}/labelitem`;

    let body = new FormData();
    body.set('doc_id', props.id);
    if (!selected){
      body.set('label', 1);
      props.onInclude(
        {id:props.id, title:props.title, abstract:props.abstract});
    } else {
      body.set('label', -1);
      props.onRevertInclude(
        {id:props.id, title:props.title, abstract:props.abstract});
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
    })
    .catch((error) => {
      console.log(error);
    });

  }


  const item  = (
      // {props.removeResultOnRevert && <Collapse in={!selected}>}
      <ListItem
        key={`result-item-${props.id}`}
      >
        <ListItemText
          primary={props.title}
          secondary={props.authors}
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="Include"
            color={selected ? "secondary": "default"}
            // className={classes.primary}
            selected={selected}
            onClick={toggleButton}
          >
            <FavoriteIcon />
          </IconButton>
        </ListItemSecondaryAction>

      </ListItem>
  )

  if(props.removeResultOnRevert){
    return (
      <Collapse
        in={selected}
        mountOnEnter
        unmountOnExit
        appear
        onExited={() => {
          console.log("item removed from DOM");
        }}
        >
      {item}
      </Collapse>
    )    
  } else {
    return <Box>{item}</Box>
  }

}

export default connect(mapStateToProps)(ListItemPaper);