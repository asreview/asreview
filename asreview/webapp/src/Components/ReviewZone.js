import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ReviewDrawer from './ReviewDrawer'
import ArticlePanel from './ArticlePanel'
import DecisionBar from './DecisionBar'
import DecisionFeedback from './DecisionFeedback'
import {
  Box,
} from '@material-ui/core'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { api_url } from './globals.js';

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

  const [logArray, setLogArray] = useState([
      { recId:  0, inc: true  },
      { recId:  1, inc: true  },
      { recId:  2, inc: false },
      { recId:  3, inc: true  },
      { recId:  4, inc: false },
      { recId:  5, inc: true  },
      { recId:  6, inc: true  },
      { recId:  7, inc: true  },
      { recId:  8, inc: false },
      { recId:  9, inc: true  },
      { recId: 10, inc: true  },
      { recId: 11, inc: false },
      { recId: 12, inc: false },
      { recId: 13, inc: false },
      { recId: 14, inc: true  },
      { recId: 15, inc: true  },
      { recId: 16, inc: false },
      { recId: 17, inc: true  },
      { recId: 18, inc: false },
      { recId: 19, inc: true  },
      { recId: 20, inc: false },
      { recId: 21, inc: false },
      { recId: 22, inc: true  },
      { recId: 23, inc: true  },
      { recId: 24, inc: false },
      { recId: 25, inc: false },
      { recId: 26, inc: true  },
      { recId: 27, inc: true  },
      { recId: 28, inc: false },
      { recId: 29, inc: false },
      { recId: 30, inc: false },
      { recId: 31, inc: true  },
      { recId: 32, inc: true  },
      { recId: 33, inc: false },
      { recId: 34, inc: false },
      { recId: 35, inc: false },
      { recId: 36, inc: true  },
      { recId: 37, inc: false },
  ]);
  const [barchartData,setBarchartData] = useState();

  useEffect(() => {
    if (!loaded) {
      getProgressInfo();
      if (record.doc_id) setModalFeedback({open: true, text: 'Learning....', elas: true});
      getDocument();
    }
  },[loaded]);

  useEffect(() => {
    const chunkSize = (Math.floor(logArray.length / 100) + 1) * 10;
    const nOfBars = Math.ceil(logArray.length / chunkSize);
    console.log(`chunkSize = ${chunkSize}, nOfBars = ${nOfBars}`);
    setBarchartData(() => {
      /*
      let arr = [];
      for (let j=0;j<nOfBars;j++) {
          arr[j]={label: (j+1)*chunkSize, included: logArray.splice(j*chunkSize,(j+1)*chunkSize-1).reduce((acc,val) => { return acc + (val.inc?1:0); } , 0)};
      }
      return arr;
      */
      return [
        { label: 10, included: 7, },
        { label: 20, included: 5, },
        { label: 30, included: 4, },
        { label: 38, included: 3, },
      ];
    });
    console.log(barchartData);
  },[logArray]);
  
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
      setLogArray([...logArray,{recId: id, inc: label?true:false}]);
      console.log(logArray);
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
      <ReviewDrawer state={props.reviewDrawerState} handle={props.handleReviewDrawer} barchartData={barchartData}/>
      <DecisionFeedback open={modalFeedback.open} text={modalFeedback.text} elas={modalFeedback.elas} />
    </Box>
  )
}

export default ReviewZone;