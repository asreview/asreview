import React, {useEffect} from 'react'
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles'

import {

  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  IconButton,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    project_id: state.project_id,
  };
};


const useStyles = makeStyles(theme => ({
  deleteIcon: {
    paddingLeft: "28px",
  },
}));


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={1}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const LabeledItems = (props) => {

  const classes = useStyles();

  // state of the item
  const [state, setState] = React.useState({
    "tab": 0,
    "data": null,
    "loading" : true,
    "edit": props.edit
  });

  const handleTabChange = (event, newValue) => {
    setState({...state, "tab": newValue});
  };

  const reloadItems = () => {
        setState({
          ...state,
          "loading": true,
        })
  }

  useEffect(() => {

    if (state.loading){
      const url = api_url + `project/${props.project_id}/prior`;

      axios.get(url)
      .then((result) => {

        setState(s => {return({
          ...s,
          "data": result.data["result"],
          "loading": false,
        })});

      })
      .catch((error) => {
        console.log("Failed to load prior information");
      });
    }

  }, [props.project_id, state.loading]);

  return (
    <Box>
      <Tabs
        value={state.tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange}
        centered
        aria-label="disabled tabs example"
      >
        <Tab label="Relevant" />
        <Tab label="Irrelevant" />
      </Tabs>

      {state["data"] !== null &&
        <TabPanel value={state.tab} index={0}>

          <List>
            {
              state["data"]
                .filter(value => value.included === 1)
                .map((value, index) =>
                  {
                    return (
                      <ListItem
                        key={`result-item-${value.id}`}
                      >
                        <ListItemText
                          primary={value.title}
                        />
                      { state.edit &&
                        <ListItemIcon
                          className={classes.deleteIcon}
                        >
                          <IconButton
                            aria-label="delete"
                            onClick={() => {props.resetItem(value.id, reloadItems)}}
                          >
                            <DeleteIcon/>
                          </IconButton>
                        </ListItemIcon>
                      }
                      </ListItem>
                    );
                  }
                )
            }
          </List>
        </TabPanel>
      }
      {state["data"] !== null &&
        <TabPanel value={state.tab} index={1}>

          <List>
            {
              state["data"]
                .filter(value => value.included !== 1)
                .map((value, index) => {

                  return (
                    <ListItem
                      key={`result-item-${value.id}`}
                    >
                      <ListItemText
                        primary={value.title}
                      />
                      { state.edit &&
                      <ListItemIcon
                        className={classes.deleteIcon}
                      >
                        <IconButton
                          aria-label="delete"
                          onClick={() => {props.resetItem(value.id, reloadItems)}}
                        >
                          <DeleteIcon/>
                        </IconButton>
                      </ListItemIcon>
                      }
                    </ListItem>
                  );
                })
              }
          </List>
        </TabPanel>
      }
    </Box>
  )

}

export default connect(
  mapStateToProps
)(LabeledItems);
