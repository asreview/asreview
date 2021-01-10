import React, { useState, useEffect } from 'react'
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Link,
  Typography,
} from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'

import ReviewDrawer from './ReviewDrawer'
import ArticlePanel from './ArticlePanel'
import DecisionBar from './DecisionBar'
import DecisionUndoBar from './DecisionUndoBar'
import { useKeyPress } from '../hooks/useKeyPress'

import { connect } from "react-redux";

import axios from 'axios'
import { api_url, reviewDrawerWidth } from '../globals.js';

// redux config
import { toggleReviewDrawer } from '../redux/actions'


const useStyles = makeStyles(theme => ({
  box: {
    paddingBottom: 30,
    overflowY: 'auto',
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: 0,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: reviewDrawerWidth,
  },
}));

const useStylesAlert = makeStyles(theme => ({
  alertFullWidth: {
    width: '100%',
    overflowY: 'auto',
  },
  alertWithDrawer: {
    width: '100%',
    overflowY: 'auto',
    paddingRight: reviewDrawerWidth,
  },
  link: {
    paddingLeft: "3px",
  },
}));



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



const ExplorationAlert = (props) => {
  const classes = useStylesAlert();

  return (
    <div className={classes.alertFullWidth}>
      <Alert severity="warning">
        <AlertTitle>You are screening through a manually pre-labeled dataset</AlertTitle>
        <div>
          Relevant documents are displayed in green. Read more about
          <Link
            className={classes.link}
            href="https://asreview.readthedocs.io/en/latest/lab/exploration.html"
            target="_blank"
          >
            <strong>Exploration Mode</strong>
          </Link>.
        </div>
      </Alert>
    </div>
  )
}

const ReviewZone = (props) => {
  const classes = useStyles();

  const [undoState, setUndoState] = useState({
    'open': false,
    'message': null,
  })

  // const [recordState, setRecordState] = useState({
  //   // is loaded
  //   'isloaded': false,
  //   // record object with metadata
  //   'record': null,
  //   // ...
  //   'selection': null,
  //   // error loading record
  //   'error': null,
  // })

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

  const [history, setHistory] = useState([]);

  const relevantPress = useKeyPress("r");
  const irrelevantPress = useKeyPress("i");
  const undoPress = useKeyPress("u");

  const storeRecordState = (label) => {
    setPreviousRecordState({
      'record': props.recordState.record,
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
    props.setRecordState({
      'isloaded': true,
      'record': previousRecordState.record,
      'selection': previousRecordState.decision,
      'error': null,
    });
}

  const startLoadingNewDocument = () => {
    props.setRecordState({
      'isloaded': false,
      'record': null,
      'selection': null,
      'error': null,
    });
  }

  const showUndoBarIfNeeded = (label, initial) => {
    if (props.undoEnabled) {
      const mark = label === 0 ? "irrelevant" : "relevant"
      const message = `${initial ? 'Marked as' : 'Converted to'} ${mark}`
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
    return props.recordState.record.doc_id === previousRecordState['record']?.doc_id
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

    const url = api_url + `project/${props.project_id}/record/${props.recordState['record'].doc_id}`;

    // set up the form
    let body = new FormData();
    body.set('doc_id', props.recordState['record'].doc_id);
    body.set('label', label);

    return axios({
      method: initial ? 'post' : 'put',
      url: url,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    })
    .then((response) => {
      console.log(`${props.project_id} - add item ${props.recordState['record'].doc_id} to ${label?"inclusions":"exclusions"}`);
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

    const getProgressHistory = () => {

      const url = api_url + `project/${props.project_id}/progress_history`;

      return axios.get(url)
        .then((result) => {
          setHistory(result.data)
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
          props.setRecordState({
            'record':result.data["result"],
            'isloaded': true,
            'selection': null,
            'error': null,
          });
        }

      })
      .catch((error) => {
        console.log(error);
        props.setRecordState({
          'record':null,
          'isloaded': true,
          'selection': null,
          'error': error["message"],
        });
      });
    }

    getProgressInfo();

    getProgressHistory();

    if (!props.recordState['isloaded']) {

      getDocument();

    }
  },[props.project_id, props.recordState, props]);

  useEffect(() => {

    /**
     * Use keyboard shortcut
     */
    if (props.keyPressEnabled) {

      if (relevantPress && props.recordState.isloaded) {
        makeDecision(1);
      }
      if (irrelevantPress && props.recordState.isloaded) {
        makeDecision(0);
      }
      if (undoPress && undoState.open && props.undoEnabled) {
        undoDecision();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantPress, irrelevantPress, undoPress]);

  return (
    <Box
      className={classes.box}
    >

      <Box
        id="main-content-item"
        className={clsx(classes.content, {
          [classes.contentShift]: props.reviewDrawerOpen,
        })}
      >

        {/* Alert Exploration Mode */}
        {props.recordState.record !== null && props.recordState.record._debug_label !== null  &&
          <ExplorationAlert/>
        }

        {/* Article panel */}
        {props.recordState.error === null && props.recordState['isloaded'] &&
          <ArticlePanel
            record={props.recordState['record']}
            showAuthors={props.showAuthors}
            textSize={props.textSize}
          />
        }

        {/* Article panel */}
        {props.recordState.error !== null &&
          <Typography
            variant="h5"
            color="textSecondary"
          >
            Unexpected error: {props.recordState.error}
          </Typography>
        }

        {/* Decision bar */}
        <DecisionBar
          reviewDrawerOpen={props.reviewDrawerOpen}
          makeDecision={makeDecision}
          block={(!props.recordState['isloaded']) || (props.recordState.error !== null)}
          recordState={props.recordState}
        />

      {/* Decision undo bar */}
      <DecisionUndoBar
          state={undoState}
          undo={undoDecision}
          close={closeUndoBar}
        />
    </Box>

    {/* Statistics drawer */}
      <ReviewDrawer
        state={props.reviewDrawerOpen}
        handle={props.toggleReviewDrawer}
        statistics={statistics}
        history={history}
      />

    </Box>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewZone);
