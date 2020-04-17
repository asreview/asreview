import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
} from '@material-ui/core'

import ReviewDrawer from './ReviewDrawer'
import ArticlePanel from './ArticlePanel'
import DecisionBar from './DecisionBar'


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

  const [recordState, setRecordState] = useState({
      'isloaded': false,
      'record': null,
    })

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

  /**
   * Include (accept) or exclude (reject) current article
   *
   * @param label  1=include, 0=exclude
   */
  const classifyInstance = (label) => {

    const url = api_url + `project/${props.project_id}/record/${recordState['record'].doc_id}`;

    // set up the form
    let body = new FormData();
    body.set('doc_id', recordState['record'].doc_id);
    body.set('label', label);

    return axios({
      method: 'post',
      url: url,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      console.log(`${props.project_id} - add item ${recordState['record'].doc_id} to ${label?"inclusions":"exclusions"}`);
      setRecordState({
        'isloaded': false,
        'record': null,
      });
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

        setRecordState({
          'record':result.data,
          'isloaded': true
        });
      })
      .catch((error) => {
        console.log(error);
      });
    }

    if (!recordState['isloaded']) {

      getProgressInfo();

      getDocument();
    }
  },[props.project_id, recordState]);

  return (
    <Box
      className={classes.box}
      height="100vh"
    >

      {/* Article panel */}
      {recordState['isloaded'] &&
        <ArticlePanel
          record={recordState['record']}
          reviewDrawerState={props.reviewDrawerState}
          showAuthors={props.showAuthors}
          textSize={props.textSize}
        />
      }

    {/* Decision bar */}
      <DecisionBar
        reviewDrawerState={props.reviewDrawerState}
        classify={classifyInstance}
        block={!recordState['isloaded']}
      />

    {/* Statistics drawer */}
      <ReviewDrawer
        state={props.reviewDrawerState}
        handle={props.handleReviewDrawer}
        statistics={statistics}
      />

    </Box>
  )
}

export default connect(mapStateToProps)(ReviewZone);
