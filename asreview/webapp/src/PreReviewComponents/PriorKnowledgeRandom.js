import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
DialogTitle,
DialogContent,
DialogActions,
} from '@material-ui/core'

import {
  PaperCard,
} from '../PreReviewComponents'


import axios from 'axios'

import { api_url, mapStateToProps } from '../globals.js';

import { connect } from "react-redux";

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
  }
}));

const PriorKnowledgeRandom = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    "records": null,
    "loaded": false,
  });

  const includeRandomDocument = () => {
    props.includeItem(state["records"].id);

    setState({
      "records": null,
      "loaded": false,
    });

    props.updatePriorStats();
  }

  const excludeRandomDocument = () => {
    props.excludeItem(state["records"].id);

    setState({
      "records": null,
      "loaded": false,
    });

    props.updatePriorStats();
  }

  useEffect(() => {

    const getDocument = () => {
      const url = api_url + `project/${props.project_id}/prior_random`;

      return axios.get(url)
      .then((result) => {
        console.log("" + result.data['result'].length + " random items served for review")
        setState({
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
  }, [props.project_id, state.loaded]);

  return (
      <Dialog
        open={props.open}
        onClose={props.handleClose}
      >
        <DialogTitle>
          Make a decision of this article
        </DialogTitle>
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
                included={null}
                onRevertInclude={() => {}}
                removeButton={false}
                classify={true}
                key={state["records"].id}
                includeItem={includeRandomDocument}
                excludeItem={excludeRandomDocument}
              />
          }

        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{}} color="primary">
            Relevant
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default connect(mapStateToProps)(PriorKnowledgeRandom);
