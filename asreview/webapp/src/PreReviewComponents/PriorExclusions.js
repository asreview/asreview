import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@material-ui/core'

import {
  PaperCard,
} from '../PreReviewComponents'


import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({
  button: {
    margin: '36px 0px 24px 12px',
    float: 'right',
  },
  margin: {
    marginTop: 20
  },
  helpertext: {
    color: "#FF0000"
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
}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const PriorExclusions = (props) => {
  const classes = useStyles();

  const [state, setState] = useState({
    "records": [],
    "loaded": false,
  });

  let n = 5;

  const getDocument = () => {
    const url = api_url + `project/${props.project_id}/prior_random`;

    return axios.get(url)
    .then((result) => {
      console.log("" + result.data['result'].length + " random items served for review")
      setState({
        "records": result.data['result'],
        "loaded": true,
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const onRemove = (id) => {

    var rec = state["records"].filter(function(record, index, arr){ return record["id"] !== id;});

    setState({
        "records": rec,
        "loaded": true,
      })
  }

  console.log(state["records"])

  useEffect(() => {
      getDocument();
  }, []);

  return (
    <Box>
      <Typography variant="h5">
        Are these 5 randomly selected publications relevant?
      </Typography>

      {!state["loaded"] ? 
        <Box className={classes.loader}>
          <CircularProgress
            style={{margin: "0 auto"}}
          />
        </Box> : 
        state["records"].map((record, index) => {
            return (
              <PaperCard
                id={record.id}
                title={record.title}
                abstract={record.abstract}
                included={null}
                onInclude={() => {}}
                onRevertInclude={() => {}}
                removeButton={false}
                classify={true}
                onRemove={onRemove}
                key={record.id}
              />
            );
          } 
        )    
      }

      {/*
      <ArticlePanel
        record={record}
        reviewDrawerState={false}
        showAuthors={false}
        slide={true}
      />
      */}

      <Button
        variant="contained"
        color="primary"
        disabled={state["records"].length !== 0 ? true : false }
        onClick={props.handleNext}
        className={classes.button}
      >
        Next
      </Button>
    </Box>
  )
}

export default connect(mapStateToProps)(PriorExclusions);