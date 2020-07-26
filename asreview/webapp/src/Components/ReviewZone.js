import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'

import {
  Box,
} from '@material-ui/core'

import ReviewDrawer from './ReviewDrawer'
import ArticlePanel from './ArticlePanel'
import DecisionBar from './DecisionBar'
import DecisionUndoBar from './DecisionUndoBar'

import { connect } from "react-redux";

import axios from 'axios'
import { api_url } from '../globals.js';

// redux config
import { toggleReviewDrawer } from '../redux/actions'


const useStyles = makeStyles({
  box: {
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
  return {
    project_id: state.project_id,
    reviewDrawerOpen: state.reviewDrawerOpen,
  };
};


function mapDispatchToProps(dispatch) {
    return({
        toggleReviewDrawer: () => {dispatch(toggleReviewDrawer())}
    })
}


const ReviewZone = (props) => {
  const classes = useStyles();

  const [undoState, setUndoState] = useState({
    'open': false,
    'message': null,
  })

  const [recordState, setRecordState] = useState({
    'isloaded': false,
    'record': null,
    'selection': null,
 })

  const [previousRecordState, setPreviousRecordState] = useState({
      'record': null,
      'decision': null,
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

  const storeRecordState = (label) => {
    setPreviousRecordState({
      'record': recordState.record,
      'decision': label,
    })
  }

  const resetPreviousRecordState = () => {
    setPreviousRecordState({
      'record': null,
      'decision': null,
    });
  }

  const loadPreviousRecordState = () => {
    setRecordState({
      'isloaded': true,
      'record': previousRecordState.record,
      'selection': previousRecordState.decision,
    });
}

  const startLoadingNewDocument = () => {
    setRecordState({
      'isloaded': false,
      'record': null,
      'selection': null,
    });
  }

  const showUndoBarIfNeeded = (label, initial) => {
    if (props.undoEnabled) {
      const mark = label === 0 ? "irrelevant" : "relevant"
      const message = `Paper ${initial ? 'marked as' : 'converted to'} ${mark}`
      showUndoBar(message)
    }
  }

  const showUndoBar = (message) => {
    setUndoState({
      'open': true,
      'message': message,
    })
  }

  const closeUndoBar = () => {
    setUndoState({
      'open': false,
      'message': null,
    })
  }

  const isUndoModeActive = () => {
    return recordState.record.doc_id === previousRecordState['record']?.doc_id
  }

  const needsClassification = (label) => {
    if (!isUndoModeActive()) {
        return true
    }
    return label !== previousRecordState.decision
  }

  const skipClassification = () => {
    resetPreviousRecordState()
    startLoadingNewDocument()
  }

  const makeDecision = (label) => {
    closeUndoBar() // hide potentially active undo bar
    if (!needsClassification(label)) {
      skipClassification()
    } else {
      classifyInstance(label, !isUndoModeActive());
    }
    storeRecordState(label)
  }

  const undoDecision = () => {
    closeUndoBar()
    loadPreviousRecordState()
  }

  /**
   * Include (accept) or exclude (reject) current article
   *
   * @param label  1=include, 0=exclude
   * @param initial   true=initial classification, false=update previous classification
   */
  const classifyInstance = (label, initial) => {

    const url = api_url + `project/${props.project_id}/record/${recordState['record'].doc_id}`;

    // set up the form
    let body = new FormData();
    body.set('doc_id', recordState['record'].doc_id);
    body.set('label', label);

    return axios({
      method: initial ? 'post' : 'put',
      url: url,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      console.log(`${props.project_id} - add item ${recordState['record'].doc_id} to ${label?"inclusions":"exclusions"}`);
      startLoadingNewDocument()
      showUndoBarIfNeeded(label, initial);
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

        /* Check for last paper */
        if (result.data["pool_empty"]){
          props.handleAppState('review-complete');
        } else {

          /* New article found and set */
          setRecordState({
            'record':result.data["result"],
            'isloaded': true,
            'selection': null,
          });
        }

      })
      .catch((error) => {
        console.log(error);
      });
    }

    if (!recordState['isloaded']) {

      getProgressInfo();

      getDocument();
    }
  },[props.project_id, recordState, props]);

  return (
    <Box
      className={classes.box}
    >

      {/* Article panel */}
      {recordState['isloaded'] &&
        <ArticlePanel
          record={recordState['record']}
          reviewDrawerState={props.reviewDrawerOpen}
          showAuthors={props.showAuthors}
          textSize={props.textSize}
        />
      }

    {/* Decision bar */}
      <DecisionBar
        reviewDrawerState={props.reviewDrawerOpen}
        makeDecision={makeDecision}
        block={!recordState['isloaded']}
        recordState={recordState}
      />

    {/* Decision undo bar */}
    <DecisionUndoBar
        state={undoState}
        undo={undoDecision}
        close={closeUndoBar}
      />

    {/* Statistics drawer */}
      <ReviewDrawer
        state={props.reviewDrawerOpen}
        handle={props.toggleReviewDrawer}
        statistics={statistics}
      />

    </Box>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewZone);
