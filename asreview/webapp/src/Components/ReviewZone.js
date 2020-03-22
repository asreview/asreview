import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
} from '@material-ui/core'

import axios from 'axios';

import ReviewDrawer from './ReviewDrawer'
import ArticlePanel from './ArticlePanel'
import DecisionBar from './DecisionBar'
import DecisionFeedback from './DecisionFeedback'

import {api_url} from '../globals.js';

const useStyles = makeStyles({
  box: {
    paddingTop: 40,
    paddingBottom: 30,
    overflowY: 'auto',
    // height: '100%',
  },
  title: {
    lineHeight: 1.2
  },
  abstract: {
  },
  authors: {
  },
  stickToBottom: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
  },
});

const ReviewZone = (props) => {
  const classes = useStyles();
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState(
    { doc_id: null,
      title: '',
      abstract: '',
      authors: ''
    }
  );
  const [slide, setSlide] = useState({
    set: false,
    direction: 'left'
  });
  const [modalFeedback, setModalFeedback] = useState({
    open: false, 
    text: '',
    elas: false
  });

  useEffect(() => {
    if (!loaded) {
      getProgressInfo();
      if (record.doc_id) setModalFeedback({open: true, text: 'Learning....', elas: true});
      getDocument();
    }
  },[loaded]);

  /**
   * Get next article
   */ 
  const getDocument = () => {
    const url = api_url + "get_document";
    return axios.get(url)
    .then((result) => {
      console.log(result);
      setRecord(result.data);
      setLoaded(true);
      setModalFeedback({open: false, text: '', elas: false});
      setSlide({set: true, direction: 'up'});  //fly in TO the top
    })
    .catch((error) => {
      console.log(error);
      setLoaded(true);  // ?
      setModalFeedback({open: false, text: '', elas: false});
      setError('some error');
    });
  }

  /**
   * Include (accept) or exclude (reject) current article
   * 
   * @param label  1=include, 0=exclude 
   */
  const classifyInstance = (label) => {
    const id = record.doc_id;
    const url = api_url + "record/" + id;
    let body = new FormData();
    body.set('doc_id', id);
    body.set('label', label);
    setModalFeedback({open: true, text: label?'Included':'Excluded', elas: false});
    setSlide({set: false, direction: label?'left':'right'});  //fly out FROM right or left
    return axios({
      method: 'post',
      url: url,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      console.log(`Article ${id} classified as ${label?"included":"excluded"}`);
      setLoaded(false);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  /**
   * Get summary statistics
   */
  const getProgressInfo = () => {
    const url = api_url + "progress";
    return axios.get(url)
      .then((result) => {
          console.log(result);
      })
      .catch((err) => {
          console.log(err)
      })
  }

   return (
    <Box className={classes.box} height="100vh">
      <ArticlePanel record={record} reviewDrawerState={props.reviewDrawerState} showAuthors={props.showAuthors} slide={slide} />
      <DecisionBar
        reviewDrawerState={props.reviewDrawerState}
        classify={classifyInstance}
        onUndo={props.handleUndo}
        block={!slide.set}
      />
      <ReviewDrawer
        state={props.reviewDrawerState}
        handle={props.handleReviewDrawer}
      />
      <DecisionFeedback open={modalFeedback.open} text={modalFeedback.text} elas={modalFeedback.elas} />
    </Box>
  )
}

export default ReviewZone;