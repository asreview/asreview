import React, { useState, useRef, useEffect } from 'react';
import {
  Box, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  List,
  MenuItem,
  Select,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import {
  HistoryListCard,
} from '../Components'

import axios from 'axios';

import { api_url } from '../globals.js';

import { connect } from "react-redux";


const useStyles = makeStyles(theme => ({
  selectMenu: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    minWidth: 130,
  },
}));

const mapStateToProps = state => {
  return {
    project_id: state.project_id,
  };
};

const HistoryDialog = (props) => {

  const classes = useStyles();

  const [openIndex, setOpenIndex] = useState("");
  const [state, setState] = useState({
    "select": 10,
    "data": null,
  });

  const handleSelectChange = (event) => {
    setState({...state, "select": event.target.value});
  };

  const updateInstance = (doc_id, label) => {

    props.setRecordState(s => {return({
        ...s,        
        'isloaded': true,
    })});

    const url = api_url + `project/${props.project_id}/record/${doc_id}`;

    // set up the form
    let body = new FormData();
    body.set('doc_id', doc_id);
    body.set('label', label === 1 ? 0 : 1);

    return axios({
      method: 'put',
      url: url,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      console.log(`${props.project_id} - add item ${doc_id} to ${label === 1 ? "exclusions" : "inclusions"}`);
      props.setRecordState(s => {return({
        ...s,
        'isloaded': false,
      })});
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const descriptionElementRef = useRef(null);
  useEffect(() => {
    if (props.history) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [props.history]);

  useEffect(() => {
    if (props.history) {
      setState(s => {return({
        ...s,
        "select": 10,
      })});
    }
  }, [props.history]);

  useEffect(() => {

    setOpenIndex("");

    if (props.history && props.recordState["isloaded"]) {

      const url = api_url + `project/${props.project_id}/prior`;

      axios.get(url)
      .then((result) => {

        setState(s => {return({
          ...s,
          "data": result.data["result"].reverse(),
        })});

      })
      .catch((error) => {
        console.log("Failed to load review history");
      });
    }

  }, [props.project_id, props.history, props.recordState]);


  return (
      <Dialog
        open={props.history}
        onClose={props.toggleHistory}
        scroll="paper"
        fullWidth={true}
        maxWidth={"sm"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">
          Review History
          {state["data"] !== null &&
            <FormControl className={classes.selectMenu}>
              <Select
                value={state.select}
                onChange={handleSelectChange}
              >
                <MenuItem value={10}>All ({state["data"].length})</MenuItem>
                <MenuItem value={20}>Relevant ({state["data"].filter(value => value.included === 1).length})</MenuItem>
                <MenuItem value={30}>Irrelevant ({state["data"].filter(value => value.included !== 1).length})</MenuItem>
              </Select>
            </FormControl>
          }
        </DialogTitle>
        <DialogContent dividers={true}>
          <Box>
            {state["data"] !== null && state["select"] === 10 &&
              <List>
                {
                  state["data"]
                    .map((value, index) =>
                      {
                        return (
                          <HistoryListCard
                            value={value}
                            index={index}
                            openIndex={openIndex}
                            setOpenIndex={setOpenIndex}
                            updateInstance={updateInstance}

                            key={`result-item-${value.id}`}
                          />
                        );
                      })
                }
              </List>
            }
            {state["data"] !== null && state["select"] === 20 &&
              <List>
                {
                  state["data"]
                    .filter(value => value.included === 1)
                    .map((value, index) =>
                      {
                        return (
                          <HistoryListCard
                            value={value}
                            index={index}
                            openIndex={openIndex}
                            setOpenIndex={setOpenIndex}
                            updateInstance={updateInstance}

                            key={`result-item-${value.id}`}
                          />
                        );
                      })
                }
              </List>
            }
            {state["data"] !== null && state["select"] === 30 &&
              <List>
                {
                  state["data"]
                    .filter(value => value.included !== 1)
                    .map((value, index) =>
                      {
                        return (
                          <HistoryListCard
                            value={value}
                            index={index}
                            openIndex={openIndex}
                            setOpenIndex={setOpenIndex}
                            updateInstance={updateInstance}

                            key={`result-item-${value.id}`}
                          />
                        );
                      })
                }
              </List>
            }
          </Box> 
        </DialogContent>
        <DialogActions>
          <Button onClick={props.toggleHistory}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default connect(
  mapStateToProps
)(HistoryDialog);
