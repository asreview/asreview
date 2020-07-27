import React, {useEffect} from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tab,
  Tabs,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

import axios from 'axios'

import {
  api_url,
  mapStateToProps
} from '../globals.js';

import { labelPriorItem } from '../PreReviewComponents/PriorKnowledge.js'

import { connect } from "react-redux";


const ResultDialogTabPanel =  (props) => {

  const [state, setState] = React.useState({
    loading: true
  })

  useEffect(() => {

    const getPriorInfo = () => {

      const url = api_url + `project/${props.project_id}/prior`;

      axios.get(url,
        {params: {subset: props.subset}}
      )
      .then((result) => {

        setState({
          result: result.data['result']
        });

      })
      .catch((error) => {
        console.log("Failed to load prior information");
      });

    }
    getPriorInfo()

  }, []);

  return (
    <Box>
      {state["result"] &&
        <List>
          {state["result"].map((value) =>
            <ListItem key={value.id}>
              <ListItemText
                primary={value.title}
                secondary={value.authors}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => labelPriorItem(props.project_id, value.id, -1)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
        )}
        </List>
      }
    </Box>
  )
}


const ResultDialog = (props) => {

  const [state, setState] = React.useState(0)

  const handleChange = (event, newValue) => {
    setState(newValue);
  };

  return (

    <Dialog
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle>
        Prior knowledge
      </DialogTitle>
      <DialogContent dividers={true}>
        <Tabs
          value={state}
          onChange={handleChange}
          centered
        >
          <Tab label="Relevant" />
          <Tab label="Irrelevant" />
        </Tabs>
        {state === 0 &&
          <ResultDialogTabPanel
            project_id={props.project_id}
            subset="included"
          />
        }
        {state === 1 &&
          <ResultDialogTabPanel
            project_id={props.project_id}
            subset="excluded"
          />
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )

}

export default connect(mapStateToProps)(ResultDialog);
