import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  List,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloseIcon from '@material-ui/icons/Close';

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
  backButton: {
    position: 'absolute',
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  detailTitle: {
    position: 'relative',
    marginLeft: '36px',
  },
  recordLabelAction: {
    flex: 'auto',
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  recordLabelActionText: {
    paddingRight: '4px',
  }
}));

const mapStateToProps = state => {
  return {
    project_id: state.project_id,
  };
};

const HistoryDialog = (props) => {

  const classes = useStyles();

  // indicate which record abstract collapse
  const [openIndex, setOpenIndex] = useState({
    "index": null,
    "record": null,
  });

  const [state, setState] = useState({
    "select": 1,
    "data": null,
  });

  // filter all records
  const handleSelectChange = (event) => {
    setState({...state, "select": event.target.value});
  };

  const handleBack = () => {
    setOpenIndex({
      "index": null,
      "record": null,
    });
  };

  // change decision of labeled records
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

  // refresh after toggle the dialog and change a decision
  useEffect(() => {

    if (props.project_id !== null) {

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

    if (props.history) {
      // show all records by default
      setState(s => {return({
        ...s,
        "select": 1,
      })});
      // back to list of records
      setOpenIndex({
        "index": null,
        "record": null,
      });
    };

  }, [props.project_id, props.history, props.recordState]);


  return (
      <Dialog
        open={props.history}
        onClose={props.toggleHistory}
        scroll="paper"
        fullWidth={true}
        maxWidth={"md"}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {openIndex["index"] === null &&
          <DialogTitle>
            Review History
            {state["data"] !== null &&
              <FormControl className={classes.selectMenu}>
                <Select
                  value={state.select}
                  onChange={handleSelectChange}
                >
                  <MenuItem value={1}>All ({state["data"].length})</MenuItem>
                  <MenuItem value={2}>Relevant ({state["data"].filter(value => value.included === 1).length})</MenuItem>
                  <MenuItem value={3}>Irrelevant ({state["data"].filter(value => value.included !== 1).length})</MenuItem>
                </Select>
              </FormControl>
            }
          </DialogTitle>
        }

        {openIndex["index"] !== null &&
          <DialogTitle>
            <IconButton
              aria-label="back"
              className={classes.backButton}
              onClick={handleBack}
            >
              <ArrowBackIcon />
            </IconButton>
            <div className={classes.detailTitle}>
              Document Details
            </div>
          </DialogTitle>
        }

        {openIndex["index"] === null &&
          <DialogContent dividers={true}>
            <Box>
              {state["data"] !== null && state["select"] === 1 &&
                <List>
                  {
                    state["data"]
                      .map((value, index) =>
                        {
                          return (
                            <HistoryListCard
                              value={value}
                              index={index}
                              state={state}
                              setOpenIndex={setOpenIndex}

                              key={`result-item-${value.id}`}
                            />
                          );
                        })
                  }
                </List>
              }
              {state["data"] !== null && state["select"] === 2 &&
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
                              state={state}
                              setOpenIndex={setOpenIndex}

                              key={`result-item-${value.id}`}
                            />
                          );
                        })
                  }
                </List>
              }
              {state["data"] !== null && state["select"] === 3 &&
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
                              state={state}
                              setOpenIndex={setOpenIndex}

                              key={`result-item-${value.id}`}
                            />
                          );
                        })
                  }
                </List>
              }
            </Box>
          </DialogContent>
        }

        {openIndex["index"] !== null &&
          <DialogContent dividers={true}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {openIndex.record.title}
              </Typography>

              {(openIndex.record.abstract === "" || openIndex.record.abstract === null) &&
                <Box fontStyle="italic">
                  <Typography gutterBottom>
                    This document doesn't have an abstract.
                  </Typography>
                </Box>
              }

              {!(openIndex.record.abstract === "" || openIndex.record.abstract === null) &&
                <Typography>
                  {openIndex.record.abstract}
                </Typography>
              }
            </Box>
          </DialogContent>
        }

        <DialogActions>
          {openIndex["index"] !== null &&
            <Box className={classes.recordLabelAction}>
              <Typography className={classes.recordLabelActionText}>
                {openIndex.record.included === 1 ? "Relevant" : "Irrelevant"}
              </Typography>
              {openIndex.record.included === 1 ? <FavoriteIcon color="secondary" /> : <CloseIcon/>}
            </Box>
          }
          {openIndex["index"] === null &&
            <Button onClick={props.toggleHistory}>
              Close
            </Button>
          }
          {openIndex["index"] !== null &&
            <Button
              onClick={() => {
                updateInstance(openIndex.record.id, openIndex.record.included)
              }}
            >
              {openIndex.record.included === 1 ? "Convert to IRRELEVANT" : "Convert to RELEVANT"}
            </Button>
          }

        </DialogActions>
      </Dialog>
  );
}

export default connect(
  mapStateToProps
)(HistoryDialog);
