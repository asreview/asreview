import React from 'react'
import {
  ListItem,
  ListItemText,
  ListItemIcon,
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
    })
    .catch((error) => {
      console.log(error);
    });

  }


  return (
      // {props.removeResultOnRevert && <Collapse in={!selected}>}
      <ListItem
        key={`result-item-${props.id}`}
         button onClick={toggleButton}
      >
        <ListItemIcon>
            <FavoriteIcon color={selected ? "secondary": "default"}/>
        </ListItemIcon>
        <ListItemText
          primary={props.title}
          secondary={props.authors}
        />
      </ListItem>
  )

}

export default connect(mapStateToProps)(ListItemPaper);
