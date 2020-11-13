import React, { useState, useRef, useEffect } from 'react';
import {
  Box, 
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  // InputLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CloseIcon from '@material-ui/icons/Close';
import UndoIcon from '@material-ui/icons/Undo';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios';

import { api_url } from '../globals.js';

import { connect } from "react-redux";

// import {
//   LabeledItems,
// } from '../PreReviewComponents';

const useStyles = makeStyles(theme => ({
  selectLabel: {
    position: 'absolute',
    right: theme.spacing(1), 
    // minWidth: 120,
  },
  selectMenu: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    minWidth: 130,
  },
  item: {
    maxWidth: 432,
  },
  iconButton: {
    left: -12,
  },
}));

const mapStateToProps = state => {
  return {
    project_id: state.project_id,
  };
};

const HistoryDialog = (props) => {

  const classes = useStyles();

  // const [filter, setFilter] = React.useState(10);
  const [state, setState] = useState({
    "select": 10,
    "data": null,
    "loading": true,
  });
  const [openIndex, setOpenIndex] = useState("");

  const handleSelectChange = (event) => {
    setState({...state, "select": event.target.value});
  };

  const handleClick = (index) => {
    if (openIndex === index) {
      setOpenIndex("");
    } else {
      setOpenIndex(index);
    };
  };

  const updateInstance = (doc_id, label) => {

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
      console.log(`${props.project_id} - add item ${doc_id} to ${label === 1 ? "inclusions" : "exclusions"}`);
      setState(s => {return({
        ...s,
        "loading": true,
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

  console.log(state.loading);

  // if (props.history) {
  //   setState(s => {return({
  //     ...s,
  //     "loading": true,
  //   })});
  // }

  useEffect(() => {

    setOpenIndex("");

    if (state.loading && props.history) {

      props.handleAppState("review-pause");

      const url = api_url + `project/${props.project_id}/prior`;

      axios.get(url)
      .then((result) => {

        setState(s => {return({
          "select": 10,
          "data": result.data["result"].reverse(),
          "loading": false,
        })});

        props.handleAppState("review");

      })
      .catch((error) => {
        console.log("Failed to load review history");
      });
    }

  }, [props.project_id, state.loading, props.history, props]);


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
                          <Box key={`result-item-${value.id}`}>
                            <ListItem>
                              {index !== openIndex &&
                                <ListItemIcon>
                                  {value.included === 1 ? <FavoriteIcon/> : <CloseIcon/>}
                                </ListItemIcon>
                              }
                              {index === openIndex &&
                                <ListItemIcon>
                                  <Tooltip title="Change decision">
                                    <IconButton 
                                      onClick={() => {updateInstance(value.id, value.included)}}
                                      className={classes.iconButton}
                                      color="secondary" 
                                    >
                                      <UndoIcon />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemIcon>
                              }
                              <ListItem
                                button
                                onClick={() => {handleClick(index)}}
                              >
                                <ListItemText
                                  primary={value.title}
                                  secondary={value.authors}
                                />
                              </ListItem>
                            </ListItem>
                            <Collapse in={index === openIndex}>
                              <ListItem>
                                <ListItemText>
                                  <Typography>
                                    {value.abstract}
                                  </Typography>
                                </ListItemText>
                              </ListItem>
                            </Collapse>
                          </Box>
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
                          <Box key={`result-item-${value.id}`}>
                            <ListItem>
                              {index !== openIndex &&
                                <ListItemIcon>
                                  {value.included === 1 ? <FavoriteIcon/> : <CloseIcon/>}
                                </ListItemIcon>
                              }
                              {index === openIndex &&
                                <ListItemIcon>
                                  <Tooltip title="Change decision">
                                    <IconButton color="secondary" className={classes.iconButton}>
                                      <UndoIcon />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemIcon>
                              }
                              <ListItem
                                button
                                onClick={() => {handleClick(index)}}
                              >
                                <ListItemText
                                  primary={value.title}
                                  secondary={value.authors}
                                />
                              </ListItem>
                            </ListItem>
                            <Collapse in={index === openIndex}>
                              <ListItem>
                                <ListItemText>
                                  <Typography>
                                    {value.abstract}
                                  </Typography>
                                </ListItemText>
                              </ListItem>
                            </Collapse>
                          </Box>
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
                          <Box key={`result-item-${value.id}`}>
                            <ListItem>
                              {index !== openIndex &&
                                <ListItemIcon>
                                  {value.included === 1 ? <FavoriteIcon/> : <CloseIcon/>}
                                </ListItemIcon>
                              }
                              {index === openIndex &&
                                <ListItemIcon>
                                  <Tooltip title="Change decision">
                                    <IconButton color="secondary" className={classes.iconButton}>
                                      <UndoIcon />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemIcon>
                              }
                              <ListItem
                                button
                                onClick={() => {handleClick(index)}}
                              >
                                <ListItemText
                                  primary={value.title}
                                  secondary={value.authors}
                                />
                              </ListItem>
                            </ListItem>
                            <Collapse in={index === openIndex}>
                              <ListItem>
                                <ListItemText>
                                  <Typography>
                                    {value.abstract}
                                  </Typography>
                                </ListItemText>
                              </ListItem>
                            </Collapse>
                          </Box>
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
