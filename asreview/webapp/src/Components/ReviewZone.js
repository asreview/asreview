import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
} from '@material-ui/core'

import ReviewDrawer from './ReviewDrawer'
import ArticlePanel from './ArticlePanel'
import DecisionBar from './DecisionBar'
import DecisionFeedback from './DecisionFeedback'


import { connect } from "react-redux";

import axios from 'axios'
import { api_url } from '../globals.js';

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

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const ReviewZone = (props) => {
  const classes = useStyles();
  // const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState(
    { doc_id: null,
      title: '',
      abstract: '',
      authors: ''
    }
  );
  const [statistics, setStatistics] = useState({
    "name": null,
    "authors": null,
    "decsription": null,
    "n_included": null,
    "n_excluded": null,
    "n_since_last_inclusion": null,
    "n_papers": null,
    "n_pool": null,
  });
  const [slide, setSlide] = useState({
    set: false,
    direction: 'left'
  });
  const [modalFeedback, setModalFeedback] = useState({
    open: false,
    text: '',
    elas: false
  });

  /**
   * Include (accept) or exclude (reject) current article
   *
   * @param label  1=include, 0=exclude
   */
  const classifyInstance = (label) => {

    const url = api_url + `project/${props.project_id}/record/${record.doc_id}`;

    // set up the form
    let body = new FormData();
    body.set('doc_id', record.doc_id);
    body.set('label', label);

    // animations
    setModalFeedback({open: true, text: label?'Included':'Excluded', elas: false});
    setSlide({set: false, direction: label?'left':'right'});  //fly out FROM right or left
    return axios({
      method: 'post',
      url: url,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      console.log(`${props.project_id} - add item ${record.doc_id} to ${label?"inclusions":"exclusions"}`);
      setLoaded(false);
    })
    .catch((error) => {
      console.log(error);
    });
  }


  useEffect(() => {

    /**
     * Get summary statistics
     */
    const getProgressInfo = () => {

      const url = api_url + `project/${props.project_id}/progress`;

      return axios.get(url)
        .then((result) => {
            setStatistics(result.data)
        })
        .catch((err) => {
            console.log(err)
        })
    }

    /**
     * Get next article
     */
    const getDocument = () => {

      const url = api_url + `project/${props.project_id}/get_document`;

      return axios.get(url)
      .then((result) => {

        setRecord(result.data);
        setLoaded(true);
        setModalFeedback({open: false, text: '', elas: false});
        setSlide({set: true, direction: 'up'});  //fly in TO the top
      })
      .catch((error) => {
        console.log(error);
        setLoaded(true);  // ?
        setModalFeedback({open: false, text: '', elas: false});
        // setError('Not possible to collect new item');
      });
    }

    if (!loaded) {

      getProgressInfo();

      if (record.doc_id) setModalFeedback({open: true, text: 'Learning....', elas: true});
      getDocument();
    }
  },[props.project_id, loaded, record.doc_id]);

  return (
    <Box className={classes.box} height="100vh">

      {/* Article panel */}
      <ArticlePanel
        record={record}
        reviewDrawerState={props.reviewDrawerState}
        showAuthors={props.showAuthors}
        textSize={props.textSize}
        slide={slide}
      />

    {/* Decision bar */}
      <DecisionBar
        reviewDrawerState={props.reviewDrawerState}
        classify={classifyInstance}
        block={!slide.set}
      />

    {/* Statistics drawer */}
      <ReviewDrawer
        state={props.reviewDrawerState}
        handle={props.handleReviewDrawer}
        statistics={statistics}
      />
      <DecisionFeedback open={modalFeedback.open} text={modalFeedback.text} elas={modalFeedback.elas} />
    </Box>
  )
}

export default connect(mapStateToProps)(ReviewZone);
