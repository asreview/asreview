import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
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
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";

import ErrorHandler from "../ErrorHandler";
import { ProjectAPI } from "../api/index.js";

import { useMutation } from "react-query";

const PREFIX = "LabeledItems";

const classes = {
  deleteIcon: `${PREFIX}-deleteIcon`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.deleteIcon}`]: {
    paddingLeft: "28px",
  },
}));

const mapStateToProps = (state) => {
  return {
    project_id: state.project_id,
  };
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Root
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </Root>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const LabeledItems = (props) => {
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

  const { mutate } = useMutation(ProjectAPI.mutateClassification, {
    onSuccess: (data, variables) => {
      reloadItems();

      // update prior stats
      props.updatePriorStats();
    },
  });

  // reset the item (for search and revert)
  const resetItem = (doc_id) => {
    mutate({
      project_id: props.project_id,
      doc_id: doc_id,
      label: -1,
      is_prior: 1,
      initial: false,
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
                              resetItem(value.id);
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
                              resetItem(value.id);
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
