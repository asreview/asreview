import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
} from '@material-ui/core'

import {
  PaperCard,
} from '../PreReviewComponents'


import {
  DialogTitleWithClose,
} from '../Components'


import axios from 'axios'

import { api_url } from '../globals.js';

const useStyles = makeStyles(theme => ({
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  margin: {
    marginTop: 20
  },
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  loader: {
    width: '100%',
  },
  clear : {
    clear: "both",
  },
}));

const n_items = 5;

const PriorKnowledgeRandom = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    "count_inclusions": 0,
    "count_exclusions": 0,
    "records": null,
    "loaded": false,
  });

  const includeRandomDocument = () => {
    props.includeItem(state["records"].id, ()=>{

      setState({
        "count_inclusions": state["count_inclusions"] + 1,
        "count_exclusions": state["count_exclusions"],
        "records": null,
        "loaded": false,
      });

      props.updatePriorStats();
    });

  }

  const excludeRandomDocument = () => {
    props.excludeItem(state["records"].id, ()=> {

      setState({
        "count_inclusions": state["count_inclusions"],
        "count_exclusions": state["count_exclusions"] + 1,
        "records": null,
        "loaded": false,
      });

      props.updatePriorStats();
    });

  }

  const resetCount = () => {
    setState({
      "count_inclusions": 0,
      "count_exclusions": 0,
      "records": null,
      "loaded": false,
    })
  }

  useEffect(() => {

    const getDocument = () => {
      const url = api_url + `project/${props.project_id}/prior_random`;

      return axios.get(url)
      .then((result) => {

        setState({
          "count_inclusions": state.count_inclusions,
          "count_exclusions": state.count_exclusions,
          "records": result.data['result'][0],
          "loaded": true,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    }

    if(!state.loaded){
      getDocument();
    }
  }, [props.project_id, state.loaded, state.count_inclusions, state.count_exclusions]);

  return (
      <Dialog
        open={true}
        onClose={props.onClose}
        fullWidth={true}
      >

        {state["count_exclusions"] < n_items &&
            <DialogTitleWithClose
              title={"Is this article relevant?"}
              onClose={props.onClose}
            />
          }
          {state["count_exclusions"] < n_items &&
            <DialogContent dividers={true}>

              {!state["loaded"] ?
                <Box className={classes.loader}>
                  <CircularProgress
                    style={{margin: "0 auto"}}
                  />
                </Box> :
                  <PaperCard
                    id={state["records"].id}
                    title={state["records"].title}
                    abstract={state["records"].abstract}
                  />
              }
            </DialogContent>
          }
          {state["count_exclusions"] < n_items &&
            <DialogActions>
              <Button
                onClick={() => excludeRandomDocument(props.id)}
                color="primary"
              >
                Irrelevant
              </Button>
              <Button
                onClick={() => includeRandomDocument(props.id)}
                color="primary"
              >
                Relevant
              </Button>
            </DialogActions>
        }

        {state["count_exclusions"] >= n_items &&
          <Box>
            <DialogTitleWithClose
              title={"Enough irrelevant items found, do you want to stop?"}
              onClose={props.onClose}
            />
            <DialogContent dividers={true}>
              <Typography>
                A total of {n_items} random articles were marked as 'irrelevant'. Usually, this is enough prior knowledge to start the review (make sure you do have enough relevant items as well).
              </Typography>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={resetCount}
                color="primary"
              >
                Show more
              </Button>
              <Button
                onClick={props.onClose}
                color="primary"
              >
                Stop
              </Button>
            </DialogActions>
          </Box>
        }

      </Dialog>
  )
}

export default PriorKnowledgeRandom;
