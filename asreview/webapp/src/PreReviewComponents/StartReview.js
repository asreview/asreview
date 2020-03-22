import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  FormControl,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search';

import {
  SearchResult,
  SearchResultDialog,
  PaperCard,
} from '../PreReviewComponents'

import {
  ArticlePanel,
  DecisionBar,
} from '../Components'

import axios from 'axios'

import { api_url } from '../globals.js';

import { connect } from "react-redux";

const useStyles = makeStyles(theme => ({

}));

const mapStateToProps = state => {
  return { project_id: state.project_id };
};

const StartReview = (props) => {
  const classes = useStyles();

  const [records, setRecords] = useState([]);

  const startTraining = () => {
    const url = api_url + `project/${props.project_id}/start`;

    return axios.post(url)
    .then((result) => {
      
      // callback function
      props.handleNext();

    })
    .catch((error) => {
      console.log(error);
    });
  }

  return (
    <Box>
      <Typography variant="h5">
        Start your systematic review
      </Typography>              

      <Button
        variant="contained"
        color="primary"
        onClick={startTraining}
      >
        Start
      </Button>
    </Box>
  )
}

export default connect(mapStateToProps)(StartReview);