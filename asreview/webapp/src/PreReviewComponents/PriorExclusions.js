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

import { api_url } from '../Components/globals.js';

import axios from 'axios'

const api = "http://localhost:5000/api/x/";

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

const PriorExclusions = (props) => {
  const classes = useStyles();

  const [records, setRecords] = useState([]);

  const getDocument = () => {
    const url = api_url + "get_prior";
    return axios.get(url)
    .then((result) => {
      console.log("get random document")
      console.log(result.data['results']);
      setRecords(result.data['results']);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {

    if (records.length === 0){
      getDocument();
    }
  });

  return (
    <Box>
      <Typography variant="h5">
        Are these (randomly selected) publications relevant?
      </Typography>

      {records.length === 0 ? 

      <Box className={classes.loader}>
        <CircularProgress
          style={{margin: "0 auto"}}
        />
      </Box> : 
        records.map((record, index) => {
            return (
              <PaperCard
                id={index}
                title={record.title}
                abstract={record.abstract}
                included={0}
                onInclude={() => {}}
                onRevertInclude={() => {}}
                removeButton={false}
                classify={true}
                onNonSelectLabel={0}

                key={index}
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
        onClick={props.handleNext}
        className={classes.button}
      >
        Next
      </Button>
    </Box>
  )
}

export default PriorExclusions;