import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import makeStyles from "@mui/styles/makeStyles";

import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";

import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return {
    project_id: state.project_id,
  };
};

const useStyles = makeStyles((theme) => ({
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
      {value === index && <Box p={1}>{children}</Box>}
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
  const [state, setState] = useState({
    tab: 0,
    data: null,
    loading: true,
  });

  const [error, setError] = useState({
    code: null,
    message: null,
  });

  const handleTabChange = (event, newValue) => {
    setState({ ...state, tab: newValue });
  };

  const reloadItems = () => {
    setState({
      ...state,
      loading: true,
    });
  };

  useEffect(() => {
    if (state.loading) {
      ProjectAPI.prior(props.project_id)
        .then((result) => {
          setState((s) => {
            return {
              ...s,
              data: result.data["result"],
              loading: false,
            };
          });
        })
        .catch((error) => {
          setError({
            code: error.code,
            message: error.message,
          });
        });
    }
  }, [props.project_id, state.loading, error.message]);

  return (
    <div>
      {error.message !== null && (
        <ErrorHandler error={error} setError={setError} />
      )}
      {error.message === null && (
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

          {state["data"] !== null && (
            <TabPanel value={state.tab} index={0}>
              <List>
                {state["data"]
                  .filter((value) => value.included === 1)
                  .map((value, index) => {
                    return (
                      <ListItem key={`result-item-${value.id}`}>
                        <ListItemText primary={value.title} />
                        <ListItemIcon className={classes.deleteIcon}>
                          <IconButton
                            aria-label="delete"
                            onClick={() => {
                              props.resetItem(value.id, reloadItems);
                            }}
                            size="large"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemIcon>
                      </ListItem>
                    );
                  })}
              </List>
            </TabPanel>
          )}
          {state["data"] !== null && (
            <TabPanel value={state.tab} index={1}>
              <List>
                {state["data"]
                  .filter((value) => value.included !== 1)
                  .map((value, index) => {
                    return (
                      <ListItem key={`result-item-${value.id}`}>
                        <ListItemText primary={value.title} />
                        <ListItemIcon className={classes.deleteIcon}>
                          <IconButton
                            aria-label="delete"
                            onClick={() => {
                              props.resetItem(value.id, reloadItems);
                            }}
                            size="large"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemIcon>
                      </ListItem>
                    );
                  })}
              </List>
            </TabPanel>
          )}
        </Box>
      )}
    </div>
  );
};

export default connect(mapStateToProps)(LabeledItems);
